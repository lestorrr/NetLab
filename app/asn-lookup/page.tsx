"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'

export default function AsnLookupPage() {
    const [ip, setIp] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const onLookup = async () => {
        if (!ip.trim()) return
        setLoading(true); setError(null); setResult(null)
        try {
            const res = await fetch('/api/asn-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Lookup failed')
            setResult(data)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolLayout title="ASN Lookup" description="Look up Autonomous System Number (ASN) information for any IP address using Team Cymru database.">
            <div className="card max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">IP Address</h2>
                <div className="flex gap-3">
                    <input
                        className="input flex-1"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="8.8.8.8"
                        onKeyDown={(e) => e.key === 'Enter' && onLookup()}
                    />
                    <button className="btn btn-primary" onClick={onLookup} disabled={loading}>
                        {loading ? 'Looking up...' : 'Lookup'}
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>

            {result && (
                <ResultCard
                    status="success"
                    title={`AS${result.asn}`}
                    subtitle={result.name || 'Unknown Organization'}
                    stats={[
                        { label: 'IP', value: result.ip },
                        { label: 'Prefix', value: result.prefix || 'N/A' },
                        { label: 'Country', value: result.country || 'N/A' },
                        { label: 'Registry', value: result.registry || 'N/A' },
                        { label: 'Allocated', value: result.allocated || 'N/A' },
                    ]}
                />
            )}
        </ToolLayout>
    )
}
