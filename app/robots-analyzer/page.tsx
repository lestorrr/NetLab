"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function RobotsAnalyzerPage() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const onAnalyze = async () => {
        if (!url.trim()) return
        setLoading(true); setError(null); setResult(null)
        try {
            const res = await fetch('/api/robots-analyzer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Analysis failed')
            setResult(data)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolLayout title="Robots.txt Analyzer" description="Analyze robots.txt, sitemap.xml, security.txt, and humans.txt for any website.">
            <div className="card max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Target URL</h2>
                <div className="flex gap-3">
                    <input
                        className="input flex-1"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="example.com"
                        onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
                    />
                    <button className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>

            {result && (
                <div className="space-y-4">
                    {/* Robots.txt */}
                    <ResultCard
                        status={result.robots?.found ? 'success' : 'warning'}
                        title="robots.txt"
                        subtitle={result.robots?.found ? result.robots.url : 'Not found'}
                        stats={result.robots?.found ? [
                            { label: 'User Agents', value: result.robots.userAgents?.length || 0 },
                            { label: 'Disallowed', value: result.robots.disallowed?.length || 0 },
                            { label: 'Allowed', value: result.robots.allowed?.length || 0 },
                            { label: 'Sitemaps', value: result.robots.sitemaps?.length || 0 },
                        ] : []}
                    >
                        {result.robots?.found && result.robots.disallowed?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Disallowed Paths</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.robots.disallowed.slice(0, 20).map((p: string, i: number) => (
                                        <code key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">{p}</code>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ResultCard>

                    {/* Sitemap */}
                    <ResultCard
                        status={result.sitemap?.found ? 'success' : 'warning'}
                        title="sitemap.xml"
                        subtitle={result.sitemap?.found ? `${result.sitemap.urlCount} URLs found` : 'Not found'}
                    >
                        {result.sitemap?.found && result.sitemap.urls?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Sample URLs</h4>
                                <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                                    {result.sitemap.urls.slice(0, 10).map((u: string, i: number) => (
                                        <div key={i} className="text-xs text-gray-600 truncate">{u}</div>
                                    ))}
                                    {result.sitemap.urls.length > 10 && (
                                        <div className="text-xs text-gray-400 mt-2">...and {result.sitemap.urls.length - 10} more</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ResultCard>

                    {/* Security.txt */}
                    <ResultCard
                        status={result.security?.found ? 'success' : 'info'}
                        title="security.txt"
                        subtitle={result.security?.found ? 'Found' : 'Not found'}
                    >
                        {result.security?.found && (
                            <OutputBox title="security.txt" value={result.security.raw} />
                        )}
                    </ResultCard>

                    {/* Humans.txt */}
                    <ResultCard
                        status={result.humans?.found ? 'success' : 'info'}
                        title="humans.txt"
                        subtitle={result.humans?.found ? 'Found' : 'Not found'}
                    >
                        {result.humans?.found && (
                            <OutputBox title="humans.txt" value={result.humans.raw} />
                        )}
                    </ResultCard>

                    {/* Raw robots.txt */}
                    {result.robots?.found && result.robots.raw && (
                        <OutputBox title="robots.txt (raw)" value={result.robots.raw} />
                    )}
                </div>
            )}
        </ToolLayout>
    )
}
