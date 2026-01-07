"use client"
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
    const [open, setOpen] = useState(false)

    const links = [
        ['Port Scanner', '/port-scanner'],
        ['HTTP Client', '/http-client'],
        ['TCP Ping', '/ping'],
        ['Speed Test', '/speed-test'],
        ['Bandwidth', '/bandwidth-monitor'],
        ['Web Server', '/simple-web-server'],
        ['SSL Scanner', '/ssl-scanner'],
        ['DNS Tools', '/dns-tools'],
        ['Security Headers', '/security-headers'],
        ['WHOIS', '/whois'],
        ['Reverse DNS', '/reverse-dns'],
        ['GeoIP', '/geoip'],
    ]

    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function handleOutside(e: MouseEvent | TouchEvent) {
            if (!menuRef.current) return
            const target = e.target as Node
            if (menuRef.current && !menuRef.current.contains(target)) {
                setOpen(false)
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleOutside)
            document.addEventListener('touchstart', handleOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleOutside)
            document.removeEventListener('touchstart', handleOutside)
        }
    }, [open])

    return (
        <header className="sticky top-0 z-40 bg-black/55 backdrop-blur-sm border-b border-white/6">
            <div className="container-page py-3">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">NetLab</Link>

                    <nav className="hidden md:flex items-center gap-4 text-sm overflow-x-auto no-scrollbar">
                        {links.map((l) => (
                            <Link key={l[1]} href={String(l[1])} className="nav-link">{String(l[0])}</Link>
                        ))}
                    </nav>

                    <div className="md:hidden">
                        <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)} className={`p-2 rounded-md bg-white/5 text-white transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
                        </button>

                        {open && (
                            <div className="fixed inset-0 z-50">
                                <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpen(false)} />
                                <aside ref={menuRef} className="mobile-menu-panel" role="menu" aria-label="Main menu">
                                    <div className="flex flex-col gap-2">
                                        {links.map((l, idx) => (
                                            <Link key={l[1]} href={String(l[1])} className="nav-link block py-3 px-3 rounded-md" style={{ transitionDelay: `${idx * 40}ms` }} onClick={() => setOpen(false)}>{String(l[0])}</Link>
                                        ))}
                                    </div>
                                </aside>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
