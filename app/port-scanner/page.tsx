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
    <ToolLayout title="Port Scanner" description="Scan TCP ports on a target host. Max 100 ports per request. Only scan authorized hosts.">
      {/* Input Form */}
      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Configuration</h2>
        <div className="grid gap-4">
          <div>
            <label className="label">Host or IP Address</label>
            <input
              className="input"
              value={host}
              onChange={e => setHost(e.target.value)}
              placeholder="example.com or 192.168.1.1"
            />
          </div>
          <div>
            <label className="label">Ports</label>
            <input
              className="input"
              value={ports}
              onChange={e => setPorts(e.target.value)}
              placeholder="22,80,443 or 80-100"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated ports or ranges (e.g., 80-90)</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              className="btn btn-primary"
              onClick={onScan}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Scan
                </>
              )}
            </button>
            {loading && <span className="text-sm text-gray-500">This may take a few seconds...</span>}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ResultCard status="error" title="Scan Failed" subtitle={error} />
      )}

      {/* Loading State */}
      {loading && !results && (
        <div className="card max-w-2xl animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-slide-up">
          <ResultCard
            status="success"
            title={`Scan Complete: ${results.host}`}
            subtitle={`Found ${results.openPorts.length} open port${results.openPorts.length !== 1 ? 's' : ''}`}
            stats={[
              { label: 'Open Ports', value: results.openPorts.length },
              { label: 'Closed/Filtered', value: results.closedCount },
              { label: 'Duration', value: `${results.tookMs.toFixed(0)}ms` }
            ]}
          >
            {results.openPorts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Open Ports</h4>
                <div className="grid gap-2">
                  {results.openPorts.map((p: any) => (
                    <div
                      key={p.port}
                      className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">✓</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Port {p.port}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-lg">{p.ms.toFixed(1)}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ResultCard>

          {/* Raw JSON Output */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Raw Response</h4>
            <OutputBox value={JSON.stringify(results, null, 2)} title="JSON Output" />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
