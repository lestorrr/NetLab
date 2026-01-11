import { NextRequest } from 'next/server'
import { checkRateLimit } from '../_lib/safeguards'

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 15, 60)
        if (rl) return rl

        const body = await req.json()
        let url = String(body.url || '').trim()

        if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }

        const baseUrl = new URL(url)
        const results: Record<string, any> = {}

        // Fetch robots.txt
        try {
            const robotsUrl = `${baseUrl.origin}/robots.txt`
            const robotsRes = await fetch(robotsUrl, {
                headers: { 'User-Agent': 'NetLab/1.0' },
                signal: AbortSignal.timeout(10000),
            })
            if (robotsRes.ok) {
                const text = await robotsRes.text()
                const lines = text.split('\n').filter(l => l.trim())
                const userAgents: string[] = []
                const disallowed: string[] = []
                const allowed: string[] = []
                const sitemaps: string[] = []

                for (const line of lines) {
                    const lower = line.toLowerCase().trim()
                    if (lower.startsWith('user-agent:')) {
                        userAgents.push(line.split(':').slice(1).join(':').trim())
                    } else if (lower.startsWith('disallow:')) {
                        disallowed.push(line.split(':').slice(1).join(':').trim())
                    } else if (lower.startsWith('allow:')) {
                        allowed.push(line.split(':').slice(1).join(':').trim())
                    } else if (lower.startsWith('sitemap:')) {
                        sitemaps.push(line.split(':').slice(1).join(':').trim())
                    }
                }

                results.robots = {
                    found: true,
                    url: robotsUrl,
                    userAgents: [...new Set(userAgents)],
                    disallowed: [...new Set(disallowed)],
                    allowed: [...new Set(allowed)],
                    sitemaps: [...new Set(sitemaps)],
                    raw: text.slice(0, 10000),
                }
            } else {
                results.robots = { found: false, url: robotsUrl, status: robotsRes.status }
            }
        } catch (e: any) {
            results.robots = { found: false, error: e.message }
        }

        // Fetch sitemap.xml
        try {
            const sitemapUrl = results.robots?.sitemaps?.[0] || `${baseUrl.origin}/sitemap.xml`
            const sitemapRes = await fetch(sitemapUrl, {
                headers: { 'User-Agent': 'NetLab/1.0' },
                signal: AbortSignal.timeout(10000),
            })
            if (sitemapRes.ok) {
                const text = await sitemapRes.text()
                const urlMatches = text.match(/<loc>([^<]+)<\/loc>/g) || []
                const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '')).slice(0, 100)

                results.sitemap = {
                    found: true,
                    url: sitemapUrl,
                    urlCount: urls.length,
                    urls: urls.slice(0, 50),
                    truncated: urls.length > 50,
                }
            } else {
                results.sitemap = { found: false, url: sitemapUrl, status: sitemapRes.status }
            }
        } catch (e: any) {
            results.sitemap = { found: false, error: e.message }
        }

        // Fetch security.txt
        try {
            const securityUrls = [
                `${baseUrl.origin}/.well-known/security.txt`,
                `${baseUrl.origin}/security.txt`,
            ]
            for (const secUrl of securityUrls) {
                try {
                    const secRes = await fetch(secUrl, {
                        headers: { 'User-Agent': 'NetLab/1.0' },
                        signal: AbortSignal.timeout(5000),
                    })
                    if (secRes.ok) {
                        const text = await secRes.text()
                        results.security = {
                            found: true,
                            url: secUrl,
                            raw: text.slice(0, 5000),
                        }
                        break
                    }
                } catch { /* continue */ }
            }
            if (!results.security) {
                results.security = { found: false }
            }
        } catch {
            results.security = { found: false }
        }

        // Fetch humans.txt
        try {
            const humansUrl = `${baseUrl.origin}/humans.txt`
            const humansRes = await fetch(humansUrl, {
                headers: { 'User-Agent': 'NetLab/1.0' },
                signal: AbortSignal.timeout(5000),
            })
            if (humansRes.ok) {
                results.humans = {
                    found: true,
                    url: humansUrl,
                    raw: (await humansRes.text()).slice(0, 5000),
                }
            } else {
                results.humans = { found: false }
            }
        } catch {
            results.humans = { found: false }
        }

        return Response.json({ url: baseUrl.origin, ...results })
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 })
    }
}
