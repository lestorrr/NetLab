"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function WhoisPage() {
    const [query, setQuery] = useState('example.com');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onLookup = async () => {
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch('/api/whois', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Whois failed');
            setResult(data.whois);
        } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };

    return (
        <ToolLayout title="WHOIS" description="Lookup WHOIS registration information for a domain or IP (limited, read-only).">
            <div className="card max-w-2xl">
                <div className="grid gap-4">
                    <div>
                        <label className="label">Domain or IP</label>
                        <input className="input" value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                    <div>
                        <button className="btn" onClick={onLookup} disabled={loading}>{loading ? 'Looking up…' : 'Lookup'}</button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            </div>

            {result && (
                <ResultCard title={`WHOIS: ${query}`}>
                    <OutputBox value={result} />
                </ResultCard>
            )}
        </ToolLayout>
    );
}
