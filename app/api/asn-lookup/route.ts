import { NextRequest } from 'next/server'
import dns from 'dns/promises'
import { checkRateLimit, checkAllowDeny } from '../_lib/safeguards'

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 15, 60)
        if (rl) return rl

        const body = await req.json()
        const ip = String(body.ip || '').trim()

        if (!ip) return Response.json({ error: 'IP address is required' }, { status: 400 })

        // Validate IP format (basic check)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
        const ipv6Regex = /^[a-fA-F0-9:]+$/
        if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
            return Response.json({ error: 'Invalid IP address format' }, { status: 400 })
        }

        const deny = checkAllowDeny(req, ip)
        if (deny) return deny

        // For IPv4, use Team Cymru DNS lookup
        // Reverse the IP and query origin.asn.cymru.com
        if (ipv4Regex.test(ip)) {
            const reversed = ip.split('.').reverse().join('.')
            const asnQuery = `${reversed}.origin.asn.cymru.com`

            try {
                const txtRecords = await dns.resolveTxt(asnQuery)
                if (txtRecords.length > 0) {
                    const record = txtRecords[0].join('')
                    // Format: "ASN | IP/Prefix | CC | Registry | Allocated"
                    const parts = record.split('|').map(p => p.trim())

                    // Get ASN description
                    let asnName = ''
                    if (parts[0]) {
                        try {
                            const asnDescQuery = `AS${parts[0]}.asn.cymru.com`
                            const asnTxt = await dns.resolveTxt(asnDescQuery)
                            if (asnTxt.length > 0) {
                                const asnParts = asnTxt[0].join('').split('|').map(p => p.trim())
                                asnName = asnParts[4] || ''
                            }
                        } catch { /* ignore */ }
                    }

                    return Response.json({
                        ip,
                        asn: parts[0] || null,
                        prefix: parts[1] || null,
                        country: parts[2] || null,
                        registry: parts[3] || null,
                        allocated: parts[4] || null,
                        name: asnName,
                        raw: record
                    })
                }
            } catch (e: any) {
                return Response.json({ error: 'ASN lookup failed', details: e.message }, { status: 502 })
            }
        }

        return Response.json({ error: 'Could not resolve ASN information' }, { status: 404 })
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 })
    }
}
