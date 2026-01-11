import Link from 'next/link'

const tools = [
  { name: 'Port Scanner', desc: 'Scan TCP ports on a target host with safe limits and protections.', href: '/port-scanner', icon: '🔍' },
  { name: 'HTTP Client', desc: 'Make GET/HEAD requests and inspect response headers and body.', href: '/http-client', icon: '🌐' },
  { name: 'TCP Ping', desc: 'Measure TCP connection latency to any host and port.', href: '/ping', icon: '📡' },
  { name: 'Speed Test', desc: 'Test your download and upload speeds with serverless endpoints.', href: '/speed-test', icon: '⚡' },
  { name: 'SSL Scanner', desc: 'Analyze SSL/TLS certificates and security configurations.', href: '/ssl-scanner', icon: '🔒' },
  { name: 'DNS Tools', desc: 'Query DNS records for any domain (A, AAAA, MX, TXT, etc).', href: '/dns-tools', icon: '📋' },
  { name: 'Security Headers', desc: 'Check HTTP security headers of any website.', href: '/security-headers', icon: '🛡️' },
  { name: 'WHOIS', desc: 'Look up domain registration and ownership information.', href: '/whois', icon: '🔎' },
  { name: 'Reverse DNS', desc: 'Find the hostname associated with an IP address.', href: '/reverse-dns', icon: '↩️' },
  { name: 'GeoIP', desc: 'Get geographic location data for any IP address.', href: '/geoip', icon: '📍' },
]

export default function Home() {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-subtle" />
          Professional Network Tools
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight text-balance">
          Network Analysis
          <span className="block text-gray-400">Made Simple</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          A collection of powerful networking tools for developers, security researchers, and IT professionals.
          Built for education and authorized testing only.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link href="/port-scanner" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <a href="#tools" className="btn btn-secondary btn-lg">
            View Tools
          </a>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="scroll-mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Tools</h2>
            <p className="text-gray-600 mt-1">Select a tool to get started</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, idx) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {tool.desc}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Warning Banner */}
      <section className="rounded-2xl bg-amber-50 border border-amber-200 p-6 flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <span className="text-amber-600 font-bold">⚠</span>
        </div>
        <div>
          <h3 className="font-semibold text-amber-900">Use Responsibly</h3>
          <p className="text-sm text-amber-800 mt-1">
            These tools are for educational and authorized testing purposes only.
            Only scan or test systems you own or have explicit permission to test.
          </p>
        </div>
      </section>
    </div>
  )
}
