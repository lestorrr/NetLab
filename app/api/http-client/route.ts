import { NextRequest } from 'next/server';
import { URL } from 'node:url';

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
    const body = await req.json();
    const urlStr = String(body.url || '').trim();
    const method = String(body.method || 'GET').toUpperCase();
    if (!urlStr) return Response.json({ error: 'URL is required' }, { status: 400 });
    if (!['GET', 'HEAD'].includes(method)) return Response.json({ error: 'Only GET and HEAD are allowed' }, { status: 400 });

    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return Response.json({ error: 'Only http/https supported' }, { status: 400 });
    }
    if (isPrivate(url.hostname)) {
      return Response.json({ error: 'Private/loopback hosts are blocked' }, { status: 400 });
    }

    const started = performance.now();
    const res = await fetch(url, { method, redirect: 'manual' });
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
