import { NextRequest } from 'next/server';
import { checkRateLimit, checkAllowDeny } from '../_lib/safeguards';

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '::1'];
function isPrivateHost(hostname: string) {
  if (BLOCKED_HOSTS.includes(hostname)) return true;
  return /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

async function fetchWithRedirects(url: URL, maxHops = 3): Promise<{ url: URL; response: Response; chain: string[] }> {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36';
  const chain: string[] = [];
  let current = url;
  for (let i = 0; i <= maxHops; i++) {
    if (isPrivateHost(current.hostname)) throw new Error('Redirected to private/loopback host');
    const res = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'user-agent': ua,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });
    // Not a redirect
    if (![301, 302, 303, 307, 308].includes(res.status)) {
      return { url: current, response: res, chain };
    }
    if (i === maxHops) return { url: current, response: res, chain };
    const location = res.headers.get('location');
    if (!location) return { url: current, response: res, chain };
    const next = new URL(location, current);
    chain.push(`${res.status} -> ${next.href}`);
    current = next;
  }
  throw new Error('Too many redirects');
}

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, 6, 60);
    if (rl) return rl;
    const body = await req.json();
    const urlStr = String(body.url || '').trim();
    if (!urlStr) return Response.json({ error: 'URL required' }, { status: 400 });

    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return Response.json({ error: 'Only http/https supported' }, { status: 400 });
    }
    const deny = checkAllowDeny(req, url.hostname);
    if (deny) return deny;
    if (isPrivateHost(url.hostname)) {
      return Response.json({ error: 'Private/loopback hosts are blocked' }, { status: 400 });
    }

    const { url: finalUrl, response: res, chain } = await fetchWithRedirects(url, 3);
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => headers[k.toLowerCase()] = v);

    const keys = [
      'strict-transport-security',
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'permissions-policy',
    ];

    const found: Record<string, string | null> = {};
    for (const k of keys) found[k] = headers[k] || null;

    return Response.json({
      url: finalUrl.href,
      status: res.status,
      statusText: res.statusText,
      redirectChain: chain,
      headers: found,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
