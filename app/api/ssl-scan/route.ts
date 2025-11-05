import { NextRequest } from 'next/server';
import tls from 'tls';
import dns from 'dns/promises';

function isPrivateIp(ip: string) {
  const privateBlocks = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^127\./, /^::1$/, /^fc00:/, /^fe80:/];
  return privateBlocks.some((re) => re.test(ip));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const host = String(body.host || '').trim();
    const port = Number(body.port || 443);
    if (!host) return Response.json({ error: 'Host required' }, { status: 400 });
    if (!Number.isFinite(port) || port < 1 || port > 65535) return Response.json({ error: 'Invalid port' }, { status: 400 });

    const addrs = await dns.lookup(host, { all: true });
    const ip = addrs[0]?.address;
    if (!ip) return Response.json({ error: 'Unable to resolve host' }, { status: 400 });
    if (isPrivateIp(ip)) return Response.json({ error: 'Private/loopback addresses are not allowed' }, { status: 400 });

    const started = performance.now();

    const details = await new Promise<any>((resolve, reject) => {
      const socket = tls.connect({
        host,
        port,
        servername: host,
        minVersion: 'TLSv1.2',
        ALPNProtocols: ['h2', 'http/1.1'],
        timeout: 5000,
      });

      const done = (err?: Error) => {
        try { socket.destroy(); } catch {}
        if (err) reject(err);
      };

      socket.once('error', (e) => done(e));
      socket.once('timeout', () => done(new Error('TLS timeout')));
      socket.once('secureConnect', () => {
        try {
          const protocol = socket.getProtocol();
          const cipher = socket.getCipher();
          const alpn = socket.alpnProtocol || null;
          const cert = socket.getPeerCertificate(true);

          const valid_from = cert.valid_from ? new Date(cert.valid_from).toISOString() : null;
          const valid_to = cert.valid_to ? new Date(cert.valid_to).toISOString() : null;
          const now = Date.now();
          const expiresMs = cert.valid_to ? new Date(cert.valid_to).getTime() - now : null;
          const days_remaining = expiresMs != null ? Math.floor(expiresMs / (1000*60*60*24)) : null;

          const san = Array.isArray(cert.subjectaltname)
            ? cert.subjectaltname
            : typeof cert.subjectaltname === 'string'
              ? cert.subjectaltname.replace(/^DNS:/g, '').split(', ').map((s: string) => s.replace(/^DNS:/, ''))
              : null;

          resolve({
            protocol,
            cipher,
            alpn,
            certificate: {
              subject: cert.subject || null,
              issuer: cert.issuer || null,
              subjectCN: cert.subject?.CN || null,
              issuerCN: cert.issuer?.CN || null,
              valid_from,
              valid_to,
              days_remaining,
              fingerprint256: cert.fingerprint256 || null,
              serialNumber: cert.serialNumber || null,
              san,
              selfSigned: !!cert.subject && !!cert.issuer && JSON.stringify(cert.subject) === JSON.stringify(cert.issuer),
            },
            tookMs: performance.now() - started,
          });
        } catch (e) {
          done(e as Error);
        } finally {
          try { socket.end(); } catch {}
        }
      });
    });

    return Response.json({ host, ip, port, ...details });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
