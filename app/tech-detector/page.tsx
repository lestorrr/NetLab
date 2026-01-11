"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'

const categoryIcons: Record<string, string> = {
    'Framework': '⚛️',
    'CMS': '📝',
    'Server': '🖥️',
    'Backend': '⚙️',
    'Analytics': '📊',
    'CDN/Hosting': '☁️',
    'Libraries': '📚',
}

const categoryColors: Record<string, string> = {
    'Framework': 'bg-purple-100 text-purple-800',
    'CMS': 'bg-blue-100 text-blue-800',
    'Server': 'bg-gray-100 text-gray-800',
    'Backend': 'bg-green-100 text-green-800',
    'Analytics': 'bg-yellow-100 text-yellow-800',
    'CDN/Hosting': 'bg-orange-100 text-orange-800',
    'Libraries': 'bg-pink-100 text-pink-800',
}

export default function TechDetectorPage() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const onDetect = async () => {
        if (!url.trim()) return
        setLoading(true); setError(null); setResult(null)
        try {
            const res = await fetch('/api/tech-detect', {
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

    // Group technologies by category
    const groupedTech = result?.technologies?.reduce((acc: any, tech: any) => {
        if (!acc[tech.category]) acc[tech.category] = []
        acc[tech.category].push(tech)
        return acc
    }, {}) || {}

    return (
        <ToolLayout title="Technology Detector" description="Detect web technologies, frameworks, CMS, servers, and analytics tools used by any website.">
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
                                Scanning...
                            </>
                        ) : 'Detect Tech'}
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>

            {result && (
                <div className="space-y-4">
                    <ResultCard
                        status="success"
                        title={`${result.count} Technologies Detected`}
                        subtitle={result.url}
                        stats={[
                            { label: 'Status', value: result.statusCode },
                            { label: 'Technologies', value: result.count },
                        ]}
                    />

                    {Object.entries(groupedTech).map(([category, techs]: [string, any]) => (
                        <div key={category} className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span>{categoryIcons[category] || '🔧'}</span>
                                {category}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {techs.map((tech: any) => (
                                    <div
                                        key={tech.name}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {tech.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ToolLayout>
    )
}
