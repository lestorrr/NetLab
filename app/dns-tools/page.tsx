"use client";
import { useState } from 'react';

export default function DnsToolsPage() {
  const [host, setHost] = useState('example.com');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  const onLookup = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/dns', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ host })});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');
      setResp(data);
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">DNS Tools</h2>
        <p className="text-sm text-gray-600">Resolve common DNS records (A/AAAA/MX/NS/TXT).</p>
      </div>
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host</label>
            <input className="input" value={host} onChange={e=>setHost(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={onLookup} disabled={loading}>{loading?'Looking up…':'Lookup'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <div className="card max-w-3xl space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500">A</div>
              <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.records.A, null, 2)}</pre>
            </div>
            <div>
              <div className="text-gray-500">AAAA</div>
              <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.records.AAAA, null, 2)}</pre>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500">MX</div>
              <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.records.MX, null, 2)}</pre>
            </div>
            <div>
              <div className="text-gray-500">NS</div>
              <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.records.NS, null, 2)}</pre>
            </div>
          </div>
          <div>
            <div className="text-gray-500">TXT</div>
            <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.records.TXT, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
