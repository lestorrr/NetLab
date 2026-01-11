import { NextRequest } from 'next/server'
import { checkRateLimit } from '../_lib/safeguards'

// Common WAF signatures in headers and responses
const WAF_SIGNATURES: Record<string, { headers?: string[]; cookies?: string[]; body?: string[] }> = {
    'Cloudflare': { headers: ['cf-ray', 'cf-cache-status', 'cf-request-id'], cookies: ['__cfduid', '__cf_bm'] },
    'AWS WAF': { headers: ['x-amzn-requestid', 'x-amz-cf-id'] },
    'Akamai': { headers: ['akamai-origin-hop', 'x-akamai-transformed'], cookies: ['ak_bmsc', 'bm_sz'] },
    'Imperva/Incapsula': { headers: ['x-iinfo', 'x-cdn'], cookies: ['visid_incap', 'incap_ses'] },
    'Sucuri': { headers: ['x-sucuri-id', 'x-sucuri-cache'], body: ['sucuri.net', 'cloudproxy'] },
    'F5 BIG-IP ASM': { headers: ['x-wa-info'], cookies: ['TS', 'BIGipServer'] },
    'ModSecurity': { headers: ['x-mod-security'], body: ['mod_security', 'modsecurity'] },
    'Barracuda': { headers: ['barra_counter_session'], cookies: ['barra_counter_session'] },
    'DDoS-Guard': { headers: ['ddos-guard'] },
    'Fastly': { headers: ['x-served-by', 'x-cache', 'x-timer'], body: ['fastly'] },
    'StackPath': { headers: ['x-sp-url', 'x-sp-waf'] },
    'KeyCDN': { headers: ['x-edge-location'] },
    'Reblaze': { headers: ['rbzid'] },
    'Varnish': { headers: ['x-varnish', 'via'] },
    'Nginx': { headers: ['x-nginx'] },
}

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 10, 60)
        if (rl) return rl

        const body = await req.json()
        let url = String(body.url || '').trim()

        if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }

        // Validate URL
        try { new URL(url) } catch { return Response.json({ error: 'Invalid URL' }, { status: 400 }) }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                redirect: 'follow',
                signal: controller.signal,
            })
            clearTimeout(timeout)

            const headers: Record<string, string> = {}
            response.headers.forEach((v, k) => { headers[k.toLowerCase()] = v })

            const bodyText = await response.text().catch(() => '')
            const bodyLower = bodyText.toLowerCase().slice(0, 50000) // Limit body scan

            const detected: Array<{ name: string; confidence: string; evidence: string[] }> = []

            for (const [wafName, signatures] of Object.entries(WAF_SIGNATURES)) {
                const evidence: string[] = []

                // Check headers
                if (signatures.headers) {
                    for (const h of signatures.headers) {
                        if (headers[h]) evidence.push(`Header: ${h}`)
                    }
                }

                // Check cookies (from set-cookie header)
                if (signatures.cookies) {
                    const setCookie = headers['set-cookie'] || ''
                    for (const c of signatures.cookies) {
                        if (setCookie.toLowerCase().includes(c.toLowerCase())) {
                            evidence.push(`Cookie: ${c}`)
                        }
                    }
                }

                // Check body
                if (signatures.body) {
                    for (const b of signatures.body) {
                        if (bodyLower.includes(b.toLowerCase())) {
                            evidence.push(`Body contains: ${b}`)
                        }
                    }
                }

                if (evidence.length > 0) {
                    const confidence = evidence.length >= 2 ? 'High' : 'Medium'
                    detected.push({ name: wafName, confidence, evidence })
                }
            }

            // Check server header
            const server = headers['server'] || ''
            const xPoweredBy = headers['x-powered-by'] || ''

            return Response.json({
                url,
                statusCode: response.status,
                server,
                xPoweredBy,
                detected,
                headerCount: Object.keys(headers).length,
                headers,
            })
        } catch (e: any) {
            clearTimeout(timeout)
            if (e.name === 'AbortError') {
                return Response.json({ error: 'Request timed out' }, { status: 504 })
            }
            throw e
        }
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 })
    }
}
