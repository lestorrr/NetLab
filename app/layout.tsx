import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'NetLab By Jhnlstrlclcn',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="container-page py-4">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">NetLab</Link>
              <nav className="flex items-center gap-4 text-sm flex-wrap">
                <Link className="nav-link" href="/port-scanner">Port Scanner</Link>
                <Link className="nav-link" href="/http-client">HTTP Client</Link>
                <Link className="nav-link" href="/ping">TCP Ping</Link>
                <Link className="nav-link" href="/speed-test">Speed Test</Link>
                <Link className="nav-link" href="/bandwidth-monitor">Bandwidth</Link>
                <Link className="nav-link" href="/simple-web-server">Web Server</Link>
                <Link className="nav-link" href="/ssl-scanner">SSL Scanner</Link>
                <Link className="nav-link" href="/dns-tools">DNS Tools</Link>
                <Link className="nav-link" href="/security-headers">Security Headers</Link>
                <Link className="nav-link" href="/whois">WHOIS</Link>
                <Link className="nav-link" href="/reverse-dns">Reverse DNS</Link>
                <Link className="nav-link" href="/geoip">GeoIP</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container-page">{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="container-page text-sm text-gray-600">
            For educational, authorized use only. Only scan or test hosts you own or have permission to test.
          </div>
        </footer>
      </body>
    </html>
  );
}
