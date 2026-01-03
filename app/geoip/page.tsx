"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function GeoIpPage() {
    const [ip, setIp] = useState('8.8.8.8');
    const [loading, setLoading] = useState(false);
    const [resp, setResp] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onLookup = async () => {
        setLoading(true); setError(null); setResp(null);
        try {
            const r = await fetch('/api/geoip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip }) });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Lookup failed');
            setResp(data);
        } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };

    return (
        <ToolLayout title="GeoIP" description="Lookup geographic and ISP information for an IP address.">
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
                <ResultCard title={`GeoIP: ${resp.ip || ip}`} stats={[{ label: 'Country', value: resp.country }, { label: 'Region', value: resp.region }, { label: 'City', value: resp.city }, { label: 'ISP', value: resp.isp || resp.org }]}>
                    <div className="mt-3"><OutputBox value={JSON.stringify(resp, null, 2)} /></div>
                </ResultCard>
            )}
        </ToolLayout>
    );
}
