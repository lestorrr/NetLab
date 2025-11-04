import { NextRequest } from 'next/server';
import net from 'net';
import dns from 'dns/promises';

function privateIp(ip: string) {
  const privateBlocks = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^127\./, /^::1$/, /^fc00:/, /^fe80:/];
  return privateBlocks.some(re => re.test(ip));
}

function tcpOnce(host: string, port: number, timeoutMs = 1000): Promise<number | null> {
  return new Promise((resolve) => {
    const start = performance.now();
    const socket = new net.Socket();
    let done = false;
    const finish = (ok: boolean) => { if (done) return; done = true; socket.destroy(); resolve(ok ? performance.now() - start : null); };
    socket.setTimeout(timeoutMs, () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host, () => finish(true));
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const host = String(body.host || '').trim();
    const port = Number(body.port || 80);
    const attempts = Math.min(10, Math.max(1, Number(body.attempts || 3)));
    if (!host) return Response.json({ error: 'Host required' }, { status: 400 });
    if (!Number.isFinite(port) || port < 1 || port > 65535) return Response.json({ error: 'Invalid port' }, { status: 400 });

    const addrs = await dns.lookup(host, { all: true });
    const ip = addrs[0]?.address;
    if (!ip) return Response.json({ error: 'Unable to resolve host' }, { status: 400 });
    if (privateIp(ip)) return Response.json({ error: 'Private/loopback addresses are not allowed' }, { status: 400 });

    const rtts: number[] = [];
    for (let i = 0; i < attempts; i++) {
      const ms = await tcpOnce(host, port, 1000);
      if (ms !== null) rtts.push(ms);
    }

    const summary = rtts.length
      ? {
          min: Math.min(...rtts),
          max: Math.max(...rtts),
          avg: rtts.reduce((a, b) => a + b, 0) / rtts.length,
        }
      : null;

    return Response.json({ host, ip, port, attempts, received: rtts.length, rtts, summary });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
