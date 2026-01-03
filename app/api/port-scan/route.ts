import { NextRequest } from 'next/server';
import net from 'net';
import dns from 'dns/promises';
import { checkRateLimit, checkAllowDeny } from '../_lib/safeguards';

function parsePorts(input: string): number[] {
  const parts = input.split(',').map(p => p.trim()).filter(Boolean);
  const set = new Set<number>();
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(n => parseInt(n, 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const start = Math.max(1, Math.min(a, b));
      const end = Math.min(65535, Math.max(a, b));
      for (let p = start; p <= end && set.size < 100; p++) set.add(p);
    } else {
      const p = parseInt(part, 10);
      if (Number.isFinite(p) && p >= 1 && p <= 65535) set.add(p);
    }
    if (set.size >= 100) break; // limit
  }
  return Array.from(set);
}

function connectOnce(host: string, port: number, timeoutMs = 500): Promise<number | null> {
  return new Promise((resolve) => {
    const start = performance.now();
    const socket = new net.Socket();
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return; done = true;
      socket.destroy();
      if (ok) resolve(performance.now() - start); else resolve(null);
    };

    socket.setTimeout(timeoutMs, () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host, () => finish(true));
  });
}

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, 6, 60);
    if (rl) return rl;
    const body = await req.json();
    const host = String(body.host || '').trim();
    const portsInput = String(body.ports || '').trim();
    if (!host) return Response.json({ error: 'Host is required' }, { status: 400 });
    if (!portsInput) return Response.json({ error: 'Ports are required' }, { status: 400 });

    // Resolve host and block private IPs / denylist to avoid SSRF into internal networks
    const addrs = await dns.lookup(host, { all: true });
    const ip = addrs[0]?.address;
    if (!ip) return Response.json({ error: 'Unable to resolve host' }, { status: 400 });
    const deny = checkAllowDeny(req, ip) || checkAllowDeny(req, host);
    if (deny) return deny;

    const ports = parsePorts(portsInput);
    if (ports.length === 0) return Response.json({ error: 'No valid ports (max 100)' }, { status: 400 });

    const started = performance.now();
    const concurrency = 50;
    const openPorts: Array<{ port: number; ms: number }> = [];
    let closedCount = 0;

    const queue = [...ports];
    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
      workers.push((async () => {
        while (queue.length) {
          const p = queue.shift()!;
          const ms = await connectOnce(host, p, 800);
          if (ms !== null) openPorts.push({ port: p, ms }); else closedCount++;
        }
      })());
    }
    await Promise.all(workers);

    openPorts.sort((a, b) => a.port - b.port);
    const tookMs = performance.now() - started;
    return Response.json({ host, ip, openPorts, closedCount, tookMs });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
