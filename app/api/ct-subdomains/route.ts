import { NextRequest } from 'next/server'
import { checkRateLimit } from '../_lib/safeguards'

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 10, 60)
        if (rl) return rl
        const body = await req.json()
        const domain = String(body.domain || '').trim().toLowerCase()
        if (!domain) return Response.json({ error: 'Domain is required' }, { status: 400 })
        if (/\s/.test(domain) || domain.length > 255) return Response.json({ error: 'Invalid domain' }, { status: 400 })

        const url = `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`
        const res = await fetch(url, { headers: { 'User-Agent': 'NetLab/1.0' } })
        if (!res.ok) return Response.json({ error: 'crt.sh error' }, { status: 502 })
        const data = await res.json()
        const set = new Set<string>()
        for (const row of data as any[]) {
            const fields: string[] = [row?.name_value, row?.common_name].filter(Boolean)
            for (const f of fields) {
                String(f).split('\n').forEach((host) => {
                    const h = host.trim().toLowerCase()
                    if (h.endsWith(domain) && !h.includes('*')) set.add(h)
                })
            }
        }
        const subdomains = Array.from(set).sort()
        return Response.json({ domain, count: subdomains.length, subdomains })
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 })
    }
}
