import { NextRequest } from 'next/server';
import { isDenied } from './config';

const RATE_MAP = new Map<string, number[]>();

export function getClientIp(req: NextRequest) {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('x-real-ip') || (req as any).ip || '127.0.0.1';
}

export function checkRateLimit(req: NextRequest, max = 10, windowSec = 60) {
    try {
        const ip = getClientIp(req);
        const now = Date.now();
        const windowMs = windowSec * 1000;
        const arr = RATE_MAP.get(ip) || [];
        const recent = arr.filter((t) => t > now - windowMs);
        if (recent.length >= max) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
        }
        recent.push(now);
        RATE_MAP.set(ip, recent);
        return null;
    } catch (e) {
        return null;
    }
}

export function isPrivateIpOrHost(ipOrHost: string) {
    if (!ipOrHost) return true;
    return /^10\./.test(ipOrHost)
        || /^192\.168\./.test(ipOrHost)
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ipOrHost)
        || /^127\./.test(ipOrHost)
        || /^::1$/.test(ipOrHost)
        || /^fc00:/.test(ipOrHost)
        || /^fe80:/.test(ipOrHost)
        || /^localhost$/.test(ipOrHost);
}

export function checkAllowDeny(req: NextRequest, target: string) {
    try {
        if (!target) return new Response(JSON.stringify({ error: 'Empty target' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        if (isDenied(target)) {
            return new Response(JSON.stringify({ error: 'Target is not allowed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return null;
    } catch (e) {
        return null;
    }
}
