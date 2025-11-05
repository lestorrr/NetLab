import { NextRequest } from 'next/server';
import dns from 'dns/promises';

async function safeResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const host = String(body.host || '').trim();
    if (!host) return Response.json({ error: 'Host required' }, { status: 400 });

    const [A, AAAA, MX, NS, TXT] = await Promise.all([
      safeResolve(async () => (await dns.resolve4(host)).slice(0, 20)),
      safeResolve(async () => (await dns.resolve6(host)).slice(0, 20)),
      safeResolve(async () => (await dns.resolveMx(host)).slice(0, 20)),
      safeResolve(async () => (await dns.resolveNs(host)).slice(0, 20)),
      safeResolve(async () => (await dns.resolveTxt(host)).slice(0, 20)),
    ]);

    return Response.json({ host, records: { A, AAAA, MX, NS, TXT } });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
