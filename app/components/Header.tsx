"use client"
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
    const [open, setOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    const mainLinks = [
        { name: 'Port Scanner', href: '/port-scanner', icon: '🔍' },
        { name: 'Banner Grabber', href: '/banner-grabber', icon: '🎛️' },
        { name: 'WAF Detector', href: '/waf-detector', icon: '🛡️' },
        { name: 'Tech Detector', href: '/tech-detector', icon: '⚙️' },
        { name: 'DNS Tools', href: '/dns-tools', icon: '📋' },
    ]

    const moreLinks = [
        { name: 'CT Subdomains', href: '/ct-subdomains', icon: '🗂️' },
        { name: 'Robots Analyzer', href: '/robots-analyzer', icon: '🤖' },
        { name: 'ASN Lookup', href: '/asn-lookup', icon: '🏢' },
        { name: 'HTTP Client', href: '/http-client', icon: '🌐' },
        { name: 'TCP Ping', href: '/ping', icon: '📡' },
        { name: 'Speed Test', href: '/speed-test', icon: '⚡' },
        { name: 'SSL Scanner', href: '/ssl-scanner', icon: '🔒' },
        { name: 'WHOIS', href: '/whois', icon: '🔎' },
        { name: 'GeoIP', href: '/geoip', icon: '📍' },
        { name: 'Subnet Calc', href: '/subnet-calc', icon: '🧮' },
        { name: 'Hash Generator', href: '/hash-generator', icon: '#️⃣' },
        { name: 'Encoder', href: '/encoder', icon: '🔣' },
    ]

    const allLinks = [...mainLinks, ...moreLinks]

    useEffect(() => {
        function handleOutside(e: MouseEvent | TouchEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        if (open || dropdownOpen) {
            document.addEventListener('mousedown', handleOutside)
            document.addEventListener('touchstart', handleOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleOutside)
            document.removeEventListener('touchstart', handleOutside)
        }
    }, [open, dropdownOpen])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [open])

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="container-page">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">NetLab</span>
                    </Link>

                    {/* Desktop Nav - hidden on portrait tablets */}
                    <nav className="hidden xl:flex items-center gap-1">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {/* More dropdown */}
                        <div ref={dropdownRef} className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                            >
                                More
                                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                                    {moreLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            <span>{link.icon}</span>
                                            <span>{link.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="xl:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
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
                    <div className="mobile-menu-overlay xl:hidden" onClick={() => setOpen(false)} />
                    <div ref={menuRef} className="mobile-menu-panel xl:hidden">
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100 z-10">
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
                        <nav className="flex flex-col gap-0.5 pb-6">
                            {allLinks.map((link, idx) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    <span className="text-base flex-shrink-0">{link.icon}</span>
                                    <span className="font-medium text-sm truncate">{link.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </>
            )}
        </header>
    )
}
