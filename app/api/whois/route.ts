import { NextRequest } from 'next/server';
import net from 'net';
import dns from 'dns/promises';
import { checkRateLimit, isPrivateIpOrHost, checkAllowDeny } from '../_lib/safeguards';

function queryWhoisServer(server: string, query: string, timeout = 7000): Promise<string> {
    return new Promise((resolve, reject) => {
        const socket = net.connect(43, server);
        let buf: Buffer[] = [];
        let timer = setTimeout(() => {
            socket.destroy();
            reject(new Error('Whois timeout'));
        }, timeout);
        socket.on('error', (e) => { clearTimeout(timer); reject(e); });
        socket.on('data', (d) => buf.push(Buffer.from(d)));
        socket.on('end', () => { clearTimeout(timer); resolve(Buffer.concat(buf).toString('utf8')); });
        socket.write(query + '\r\n');
        socket.end();
    });
}

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 4, 60);
        if (rl) return rl;

        const body = await req.json();
        const query = String(body.query || '').trim();
        if (!query) return Response.json({ error: 'Query is required' }, { status: 400 });

        // quick validation to avoid private targets and denylisted targets
        if (isPrivateIpOrHost(query)) return Response.json({ error: 'Private/loopback targets are not allowed' }, { status: 400 });
        const deny = checkAllowDeny(req, query);
        if (deny) return deny;

        // Try iana first then follow referral if present
        const primary = 'whois.iana.org';
        let resp = await queryWhoisServer(primary, query).catch(() => '');
        let referral = '';
        const m = resp.match(/(whois|refer|Registrar WHOIS Server):\s*([\w.-]+)/i);
        if (m) referral = m[2];
        if (referral) {
            try { const r2 = await queryWhoisServer(referral, query); resp += '\n---\n' + r2; } catch { }
        }

        // cap length
        if (resp.length > 150_000) resp = resp.slice(0, 150_000) + '\n...truncated...';
        return Response.json({ query, whois: resp });
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
    }
}
