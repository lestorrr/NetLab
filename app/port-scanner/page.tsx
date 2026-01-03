"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

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
    <ToolLayout title="Port Scanner" description="Educational use only. Max 100 ports per request. Only scan authorized hosts.">
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host or IP</label>
            <input className="input" value={host} onChange={e => setHost(e.target.value)} placeholder="example.com" />
          </div>
          <div>
            <label className="label">Ports (comma-separated or ranges like 80-90)</label>
            <input className="input" value={ports} onChange={e => setPorts(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={onScan} disabled={loading}>{loading ? 'Scanning…' : 'Scan'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {results && (
        <ResultCard title={`Results for ${results.host}`} subtitle={`Open ports: ${results.openPorts.length}`} stats={[{ label: 'Open', value: results.openPorts.length }, { label: 'Closed/Filtered', value: results.closedCount }, { label: 'Took (ms)', value: results.tookMs.toFixed(1) }]}>
          <div className="space-y-2">
            <ul className="list-none space-y-1">
              {results.openPorts.map((p: any) => (
                <div key={p.port} className="flex items-center justify-between p-2 rounded-md bg-white">
                  <div className="font-medium">Port {p.port}</div>
                  <div className="text-sm text-gray-600">{p.ms.toFixed(1)} ms</div>
                </div>
              ))}
            </ul>
            <OutputBox value={JSON.stringify(results, null, 2)} />
          </div>
        </ResultCard>
      )}
    </ToolLayout>
  )
}
