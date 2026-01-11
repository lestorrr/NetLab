import { NextRequest } from 'next/server'
import { checkRateLimit } from '../_lib/safeguards'

// Technology detection patterns
const TECH_PATTERNS: Record<string, { headers?: Record<string, RegExp>; meta?: RegExp[]; scripts?: RegExp[]; body?: RegExp[]; cookies?: RegExp[] }> = {
    // Frameworks
    'React': { body: [/react/i, /_reactroot/i], scripts: [/react\.production\.min\.js/i, /react-dom/i] },
    'Vue.js': { body: [/vue/i, /data-v-[a-f0-9]+/i], scripts: [/vue\..*\.js/i] },
    'Angular': { body: [/ng-version/i, /\[\[ngSwitch\]\]/i], scripts: [/angular/i] },
    'Next.js': { body: [/__NEXT_DATA__/i, /_next\/static/i], headers: { 'x-powered-by': /next\.js/i } },
    'Nuxt.js': { body: [/__NUXT__/i, /_nuxt\//i] },
    'Svelte': { body: [/svelte/i], scripts: [/svelte/i] },

    // CMS
    'WordPress': { body: [/wp-content/i, /wp-includes/i], headers: { 'x-powered-by': /wordpress/i }, meta: [/wordpress/i] },
    'Drupal': { body: [/drupal/i, /sites\/default\/files/i], headers: { 'x-drupal-cache': /./ } },
    'Joomla': { body: [/joomla/i, /\/media\/jui\//i] },
    'Shopify': { body: [/shopify/i, /cdn\.shopify\.com/i] },
    'Wix': { body: [/wix\.com/i, /wixstatic\.com/i] },
    'Squarespace': { body: [/squarespace/i] },

    // Servers
    'Nginx': { headers: { 'server': /nginx/i } },
    'Apache': { headers: { 'server': /apache/i } },
    'IIS': { headers: { 'server': /microsoft-iis/i } },
    'LiteSpeed': { headers: { 'server': /litespeed/i } },

    // Languages
    'PHP': { headers: { 'x-powered-by': /php/i }, cookies: [/phpsessid/i] },
    'ASP.NET': { headers: { 'x-powered-by': /asp\.net/i, 'x-aspnet-version': /./ }, cookies: [/asp\.net_sessionid/i] },
    'Python': { headers: { 'server': /python|werkzeug|gunicorn|uvicorn/i } },
    'Ruby': { headers: { 'x-powered-by': /phusion passenger/i, 'server': /puma|unicorn/i } },

    // Analytics & Tools
    'Google Analytics': { body: [/google-analytics\.com/i, /googletagmanager\.com/i, /gtag\(/i] },
    'Google Tag Manager': { body: [/googletagmanager\.com\/gtm/i] },
    'Facebook Pixel': { body: [/connect\.facebook\.net/i, /fbq\(/i] },
    'Hotjar': { body: [/static\.hotjar\.com/i] },

    // CDN
    'Cloudflare': { headers: { 'cf-ray': /./, 'server': /cloudflare/i } },
    'Fastly': { headers: { 'x-served-by': /cache/i, 'x-cache': /./ } },
    'AWS CloudFront': { headers: { 'x-amz-cf-id': /./, 'via': /cloudfront/i } },
    'Vercel': { headers: { 'x-vercel-id': /./, 'server': /vercel/i } },
    'Netlify': { headers: { 'x-nf-request-id': /./, 'server': /netlify/i } },

    // JavaScript Libraries
    'jQuery': { scripts: [/jquery/i], body: [/jquery/i] },
    'Bootstrap': { body: [/bootstrap/i], scripts: [/bootstrap/i] },
    'Tailwind CSS': { body: [/tailwindcss/i] },
    'Font Awesome': { body: [/fontawesome/i, /font-awesome/i] },
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

        try { new URL(url) } catch { return Response.json({ error: 'Invalid URL' }, { status: 400 }) }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)

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
            const bodyLower = bodyText.slice(0, 100000)

            const detected: Array<{ name: string; category: string; evidence: string }> = []

            for (const [techName, patterns] of Object.entries(TECH_PATTERNS)) {
                let found = false
                let evidence = ''

                // Check headers
                if (patterns.headers) {
                    for (const [header, regex] of Object.entries(patterns.headers)) {
                        if (headers[header] && regex.test(headers[header])) {
                            found = true
                            evidence = `Header: ${header}`
                            break
                        }
                    }
                }

                // Check body patterns
                if (!found && patterns.body) {
                    for (const regex of patterns.body) {
                        if (regex.test(bodyLower)) {
                            found = true
                            evidence = 'HTML content'
                            break
                        }
                    }
                }

                // Check scripts
                if (!found && patterns.scripts) {
                    for (const regex of patterns.scripts) {
                        if (regex.test(bodyLower)) {
                            found = true
                            evidence = 'JavaScript'
                            break
                        }
                    }
                }

                // Check cookies
                if (!found && patterns.cookies) {
                    const setCookie = (headers['set-cookie'] || '').toLowerCase()
                    for (const regex of patterns.cookies) {
                        if (regex.test(setCookie)) {
                            found = true
                            evidence = 'Cookie'
                            break
                        }
                    }
                }

                if (found) {
                    const category = techName.includes('Analytics') || techName.includes('Pixel') || techName.includes('Hotjar') || techName.includes('Tag Manager') ? 'Analytics' :
                        techName.includes('Cloudflare') || techName.includes('Fastly') || techName.includes('CloudFront') || techName.includes('Vercel') || techName.includes('Netlify') ? 'CDN/Hosting' :
                            techName.includes('PHP') || techName.includes('ASP') || techName.includes('Python') || techName.includes('Ruby') ? 'Backend' :
                                techName.includes('Nginx') || techName.includes('Apache') || techName.includes('IIS') || techName.includes('LiteSpeed') ? 'Server' :
                                    techName.includes('WordPress') || techName.includes('Drupal') || techName.includes('Joomla') || techName.includes('Shopify') || techName.includes('Wix') || techName.includes('Squarespace') ? 'CMS' :
                                        techName.includes('jQuery') || techName.includes('Bootstrap') || techName.includes('Tailwind') || techName.includes('Font Awesome') ? 'Libraries' :
                                            'Framework'

                    detected.push({ name: techName, category, evidence })
                }
            }

            // Sort by category
            detected.sort((a, b) => a.category.localeCompare(b.category))

            return Response.json({
                url,
                statusCode: response.status,
                technologies: detected,
                count: detected.length,
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
