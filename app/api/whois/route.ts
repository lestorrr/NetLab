import { NextRequest } from 'next/server';
import dns from 'dns/promises';
import { checkRateLimit, isPrivateIpOrHost, checkAllowDeny } from '../_lib/safeguards';

async function queryWhoisServer(server: string, query: string): Promise<string> {
    const accountNumber = "860350795";
    const apiKey = "1HqaEYqf_v8sRW_r7a0E";
    const url = `https://jsonwhoisapi.com/api/v1/whois?identifier=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "Authorization": `Basic ${Buffer.from(`${accountNumber}:${apiKey}`).toString("base64")}`
        }
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`WHOIS API error: ${res.status} ${res.statusText} ${txt}`);
    }

    const data = await res.json().catch(() => null);
    if (!data) return '';

    // Prefer raw text if available, otherwise return the JSON stringified response
    if (typeof data.raw === 'string' && data.raw.trim().length > 0) return data.raw;
    return JSON.stringify(data, null, 2);
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

        // Try IANA first to find referral, but also try JSONWHOISAPI if IANA returns nothing
        const primary = 'whois.iana.org';
        let resp = await queryWhoisServer(primary, query).catch(() => '');

        // If IANA returned nothing, try the JSONWHOISAPI directly (queryWhoisServer already uses it)
        if (!resp || resp.trim().length === 0) {
            resp = await queryWhoisServer('', query).catch(() => '');
        }

        let referral = '';
        const m = resp.match(/(whois|refer|Registrar WHOIS Server):\s*([\w.-]+)/i);
        if (m) referral = m[2];
        if (referral) {
            try {
                const r2 = await queryWhoisServer(referral, query);
                if (r2 && r2.trim().length > 0) resp += '\n---\n' + r2;
            } catch { /* ignore referral failures */ }
        }

        // If still empty, return a clear error so the frontend shows it
        if (!resp || resp.trim().length === 0) {
            return Response.json({ error: 'WHOIS lookup returned no data for that query' }, { status: 404 });
        }

        // cap length
        if (resp.length > 150_000) resp = resp.slice(0, 150_000) + '\n...truncated...';
        return Response.json({ query, whois: resp });
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
    }
}