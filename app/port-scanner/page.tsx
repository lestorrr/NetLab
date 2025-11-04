"use client";
import { useState } from 'react';

export default function PortScannerPage() {
  const [host, setHost] = useState('example.com');
  const [ports, setPorts] = useState('22,80,443');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onScan = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, ports })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Port Scanner</h2>
        <p className="text-sm text-gray-600">Educational use only. Max 100 ports per request. Only scan authorized hosts.</p>
      </div>
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host or IP</label>
            <input className="input" value={host} onChange={e=>setHost(e.target.value)} placeholder="example.com" />
          </div>
          <div>
            <label className="label">Ports (comma-separated or ranges like 80-90)</label>
            <input className="input" value={ports} onChange={e=>setPorts(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={onScan} disabled={loading}>{loading ? 'Scanning…' : 'Scan'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {results && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-medium">Results for {results.host}</h3>
          <p className="text-sm text-gray-600">Open ports: {results.openPorts.length}</p>
          <ul className="list-disc pl-5 text-sm">
            {results.openPorts.map((p: any) => (
              <li key={p.port}>Port {p.port} open (time {p.ms.toFixed(1)} ms)</li>
            ))}
          </ul>
          {results.closedCount > 0 && <p className="text-sm text-gray-600 mt-2">Closed/filtered: {results.closedCount}</p>}
          <p className="text-sm text-gray-600 mt-2">Took {results.tookMs.toFixed(1)} ms</p>
        </div>
      )}
    </div>
  );
}
