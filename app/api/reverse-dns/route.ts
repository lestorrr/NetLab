import { NextRequest } from 'next/server';
import dns from 'dns/promises';
import { checkRateLimit, isPrivateIpOrHost, checkAllowDeny } from '../_lib/safeguards';

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 20, 60);
        if (rl) return rl;

        const body = await req.json();
        const ip = String(body.ip || '').trim();
        if (!ip) return Response.json({ error: 'IP is required' }, { status: 400 });
        if (isPrivateIpOrHost(ip)) return Response.json({ error: 'Private/loopback addresses are not allowed' }, { status: 400 });
        const deny = checkAllowDeny(req, ip);
        if (deny) return deny;

        try {
            const ptr = await dns.reverse(ip);
            return Response.json({ ip, ptr });
        } catch (e: any) {
            return Response.json({ ip, ptr: null, error: 'No PTR records or lookup failed' });
        }
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
    }
}
