import { NextRequest } from 'next/server';
import { checkRateLimit, isPrivateIpOrHost, checkAllowDeny } from '../_lib/safeguards';

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 10, 60);
        if (rl) return rl;

        const body = await req.json();
        const ip = String(body.ip || '').trim();
        if (!ip) return Response.json({ error: 'IP is required' }, { status: 400 });
        if (isPrivateIpOrHost(ip)) return Response.json({ error: 'Private/loopback addresses are not allowed' }, { status: 400 });
        const deny = checkAllowDeny(req, ip);
        if (deny) return deny;

        // Use a public geoip JSON API (free tier). If you prefer a local DB, install geoip-lite.
        const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,lat,lon,isp,org,query,timezone`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== 'success') return Response.json({ error: data.message || 'Lookup failed' }, { status: 400 });
        return Response.json({ ip: data.query, country: data.country, region: data.regionName, city: data.city, lat: data.lat, lon: data.lon, isp: data.isp, org: data.org, timezone: data.timezone });
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
    }
}
