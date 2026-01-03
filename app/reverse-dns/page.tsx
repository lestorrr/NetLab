"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function ReverseDnsPage() {
    const [ip, setIp] = useState('8.8.8.8');
    const [loading, setLoading] = useState(false);
    const [resp, setResp] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onLookup = async () => {
        setLoading(true); setError(null); setResp(null);
        try {
            const r = await fetch('/api/reverse-dns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip }) });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Lookup failed');
            setResp(data);
        } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };

    return (
        <ToolLayout title="Reverse DNS" description="Resolve PTR (reverse) DNS records for an IP address.">
            <div className="card max-w-2xl">
                <div className="grid gap-4">
                    <div>
                        <label className="label">IP address</label>
                        <input className="input" value={ip} onChange={e => setIp(e.target.value)} />
                    </div>
                    <div>
                        <button className="btn" onClick={onLookup} disabled={loading}>{loading ? 'Looking up…' : 'Lookup'}</button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            </div>

            {resp && (
                <ResultCard title={`PTR for ${resp.ip}`}>
                    {resp.ptr ? <ul className="list-disc pl-5 text-sm">{resp.ptr.map((p: string) => <li key={p}>{p}</li>)}</ul> : <p className="text-sm text-gray-600">No PTR records found.</p>}
                    <div className="mt-3"><OutputBox value={JSON.stringify(resp, null, 2)} /></div>
                </ResultCard>
            )}
        </ToolLayout>
    );
}
