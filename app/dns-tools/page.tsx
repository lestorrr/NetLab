"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function DnsToolsPage() {
  const [host, setHost] = useState('example.com');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onLookup = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/dns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');
      setResp(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <ToolLayout title="DNS Tools" description="Resolve common DNS records (A/AAAA/MX/NS/TXT).">
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host</label>
            <input className="input" value={host} onChange={e => setHost(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={onLookup} disabled={loading}>{loading ? 'Looking up…' : 'Lookup'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <ResultCard title={`DNS records for ${resp.host}`}>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">A</div>
              <OutputBox value={JSON.stringify(resp.records.A, null, 2)} />
            </div>
            <div>
              <div className="text-gray-500">AAAA</div>
              <OutputBox value={JSON.stringify(resp.records.AAAA, null, 2)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <div className="text-gray-500">MX</div>
              <OutputBox value={JSON.stringify(resp.records.MX, null, 2)} />
            </div>
            <div>
              <div className="text-gray-500">NS</div>
              <OutputBox value={JSON.stringify(resp.records.NS, null, 2)} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-gray-500">TXT</div>
            <OutputBox value={JSON.stringify(resp.records.TXT, null, 2)} />
          </div>
        </ResultCard>
      )}
    </ToolLayout>
  );
}
