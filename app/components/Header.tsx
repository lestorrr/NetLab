"use client"
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)

    const links = [
        { name: 'Port Scanner', href: '/port-scanner', icon: '🔍' },
        { name: 'HTTP Client', href: '/http-client', icon: '🌐' },
        { name: 'TCP Ping', href: '/ping', icon: '📡' },
        { name: 'Speed Test', href: '/speed-test', icon: '⚡' },
        { name: 'SSL Scanner', href: '/ssl-scanner', icon: '🔒' },
        { name: 'DNS Tools', href: '/dns-tools', icon: '📋' },
        { name: 'WHOIS', href: '/whois', icon: '🔎' },
        { name: 'GeoIP', href: '/geoip', icon: '📍' },
    ]

    useEffect(() => {
        function handleOutside(e: MouseEvent | TouchEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [open])

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
            <div className="container-page">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">NetLab</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <>
                    <div className="mobile-menu-overlay lg:hidden" onClick={() => setOpen(false)} />
                    <div ref={menuRef} className="mobile-menu-panel lg:hidden">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-lg font-bold text-gray-900">Menu</span>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex flex-col gap-1">
                            {links.map((link, idx) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 animate-slide-up"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </>
            )}
        </header>
    )
}
