"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function CtSubdomainsPage() {
    const [domain, setDomain] = useState('example.com')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const onFetch = async () => {
        setLoading(true); setError(null); setData(null)
        try {
            const res = await fetch('/api/ct-subdomains', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain }) })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Fetch failed')
            setData(json)
        } catch (e: any) { setError(e.message) } finally { setLoading(false) }
    }

    return (
        <ToolLayout title="CT Subdomain Finder" description="Passive discovery of subdomains using Certificate Transparency logs (crt.sh)">
            <div className="card max-w-2xl">
                <div className="grid gap-4">
                    <div>
                        <label className="label">Domain</label>
                        <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="btn btn-primary" onClick={onFetch} disabled={loading}>{loading ? 'Searching…' : 'Find Subdomains'}</button>
                        <p className="text-xs text-gray-500">Passive lookup — no scanning performed.</p>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            </div>

            {data && (
                <div className="space-y-4">
                    <ResultCard status="info" title={`Found ${data.count} subdomains`} subtitle={data.domain} />
                    <div className="card">
                        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {data.subdomains.map((s: string) => (
                                <li key={s} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
                                    <span className="text-sm text-gray-800 truncate">{s}</span>
                                    <a target="_blank" href={`https://${s}`} className="text-xs text-blue-600 hover:underline">Open</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <OutputBox title="Raw" value={JSON.stringify(data, null, 2)} />
                </div>
            )}
        </ToolLayout>
    )
}
