"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function BannerGrabberPage() {
    const [host, setHost] = useState('example.com')
    const [port, setPort] = useState(80)
    const [hint, setHint] = useState('http')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const onGrab = async () => {
        setLoading(true); setError(null); setResult(null)
        try {
            const res = await fetch('/api/banner-grab', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host, port, hint }) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to grab banner')
            setResult(data)
        } catch (e: any) { setError(e.message) } finally { setLoading(false) }
    }

    return (
        <ToolLayout title="Service Banner Grabber" description="Connect to a TCP service and read its greeting/banner. Educational, authorized use only.">
            <div className="card max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Details</h2>
                <div className="grid gap-4">
                    <div>
                        <label className="label">Host</label>
                        <input className="input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="label">Port</label>
                            <input className="input" type="number" value={port} onChange={(e) => setPort(parseInt(e.target.value, 10))} />
                        </div>
                        <div>
                            <label className="label">Protocol hint</label>
                            <select className="input" value={hint} onChange={(e) => setHint(e.target.value)}>
                                <option value="">Generic</option>
                                <option value="http">HTTP</option>
                                <option value="smtp">SMTP</option>
                                <option value="imap">IMAP</option>
                                <option value="pop3">POP3</option>
                                <option value="redis">Redis</option>
                                <option value="telnet">Telnet</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                        <button className="btn btn-primary w-full sm:w-auto" onClick={onGrab} disabled={loading}>
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Connecting…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Grab Banner
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-500">Avoid scanning hosts you don't own or control.</p>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                </div>
            </div>

            {result && (
                <div className="space-y-4">
                    <ResultCard status="info" title={`Banner from ${result.host}:${result.port}`} subtitle={`Bytes: ${result.bytes} • Time: ${Math.round(result.elapsedMs)}ms`} />
                    <OutputBox title="Banner" value={result.banner || ''} />
                </div>
            )}
        </ToolLayout>
    )
}
