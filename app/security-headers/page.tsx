"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function SecurityHeadersPage() {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onScan = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/security-headers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResp(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <ToolLayout title="Security Headers" description="Check for common HTTP security headers (GET request, no redirects followed).">
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">URL</label>
            <input className="input" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={onScan} disabled={loading}>{loading ? 'Scanning…' : 'Scan'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <ResultCard title={`Status: ${resp.status} ${resp.statusText}`}>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {Object.entries(resp.headers).map(([k, v]: any) => (
              <div key={k}>
                <div className="text-gray-500">{k}</div>
                <div className="font-medium break-words">{v || '—'}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <OutputBox value={JSON.stringify(resp.headers, null, 2)} />
          </div>
        </ResultCard>
      )}
    </ToolLayout>
  );
}
