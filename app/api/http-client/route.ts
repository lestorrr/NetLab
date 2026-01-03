import { NextRequest } from 'next/server';
import { URL } from 'node:url';
import { checkRateLimit, checkAllowDeny } from '../_lib/safeguards';

const BLOCKED_HOSTS = [
  'localhost', '127.0.0.1', '::1'
];

function isPrivate(hostname: string) {
  if (BLOCKED_HOSTS.includes(hostname)) return true;
  // crude private patterns
  return /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, 8, 60);
    if (rl) return rl;
    const body = await req.json();
    const urlStr = String(body.url || '').trim();
    const method = String(body.method || 'GET').toUpperCase();
    if (!urlStr) return Response.json({ error: 'URL is required' }, { status: 400 });
    if (!['GET', 'HEAD'].includes(method)) return Response.json({ error: 'Only GET and HEAD are allowed' }, { status: 400 });

    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return Response.json({ error: 'Only http/https supported' }, { status: 400 });
    }
    const deny = checkAllowDeny(req, url.hostname);
    if (deny) return deny;

    const started = performance.now();
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36';
    const res = await fetch(url, {
      method,
      redirect: 'manual',
      headers: {
        'user-agent': ua,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      }
    });
    const elapsed = performance.now() - started;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => headers[k] = v);

    let bodyPreview: string | null = null;
    let bodySize: number | null = null;
    if (method === 'GET') {
      const buf = Buffer.from(await res.arrayBuffer());
      bodySize = buf.length;
      bodyPreview = buf.subarray(0, 512).toString('utf8');
    }

    return Response.json({
      url: url.href,
      status: res.status,
      statusText: res.statusText,
      headers,
      timeMs: elapsed,
      bodySize,
      bodyPreview
    });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
