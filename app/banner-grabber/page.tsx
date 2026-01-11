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
                <div className="grid gap-4">
                    <div>
                        <label className="label">Host</label>
                        <input className="input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                    <div className="flex items-center gap-3">
                        <button className="btn btn-primary" onClick={onGrab} disabled={loading}>{loading ? 'Connecting…' : 'Grab Banner'}</button>
                        <p className="text-xs text-gray-500">Avoid scanning hosts you don't own or control.</p>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
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
