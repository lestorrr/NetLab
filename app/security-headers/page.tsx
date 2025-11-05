"use client";
import { useState } from 'react';

export default function SecurityHeadersPage() {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  const onScan = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/security-headers', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ url })});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResp(data);
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Security Headers</h2>
        <p className="text-sm text-gray-600">Check for common HTTP security headers (GET request, no redirects followed).</p>
      </div>
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">URL</label>
            <input className="input" value={url} onChange={e=>setUrl(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={onScan} disabled={loading}>{loading?'Scanning…':'Scan'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <div className="card max-w-2xl space-y-2 text-sm">
          <p><span className="text-gray-500">Status:</span> {resp.status} {resp.statusText}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(resp.headers).map(([k, v]: any) => (
              <div key={k}>
                <div className="text-gray-500">{k}</div>
                <div className="font-medium break-words">{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
