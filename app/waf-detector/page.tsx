"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'

export default function WafDetectorPage() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const onDetect = async () => {
        if (!url.trim()) return
        setLoading(true); setError(null); setResult(null)
        try {
            const res = await fetch('/api/waf-detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Detection failed')
            setResult(data)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolLayout title="WAF Detector" description="Detect Web Application Firewalls (WAF) and CDN providers protecting a website.">
            <div className="card max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Target URL</h2>
                <div className="flex gap-3">
                    <input
                        className="input flex-1"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="example.com or https://example.com"
                        onKeyDown={(e) => e.key === 'Enter' && onDetect()}
                    />
                    <button className="btn btn-primary" onClick={onDetect} disabled={loading}>
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Detecting...
                            </>
                        ) : 'Detect WAF'}
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>

            {result && (
                <div className="space-y-4">
                    <ResultCard
                        status={result.detected.length > 0 ? 'warning' : 'success'}
                        title={result.detected.length > 0 ? 'WAF/CDN Detected' : 'No WAF Detected'}
                        subtitle={result.url}
                        stats={[
                            { label: 'Status', value: result.statusCode },
                            { label: 'Server', value: result.server || 'Hidden' },
                            { label: 'WAFs Found', value: result.detected.length },
                        ]}
                    />

                    {result.detected.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected WAF/CDN</h3>
                            <div className="space-y-3">
                                {result.detected.map((waf: any, idx: number) => (
                                    <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-gray-900">{waf.name}</span>
                                            <span className={`badge ${waf.confidence === 'High' ? 'badge-error' : 'badge-warning'}`}>
                                                {waf.confidence} Confidence
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Evidence: {waf.evidence.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Headers</h3>
                        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs overflow-auto max-h-64">
                            {Object.entries(result.headers).map(([k, v]) => (
                                <div key={k}><span className="text-blue-400">{k}:</span> {String(v)}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </ToolLayout>
    )
}
