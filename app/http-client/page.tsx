"use client";
import { useState } from 'react';

export default function HttpClientPage() {
  const [url, setUrl] = useState('https://example.com');
  const [method, setMethod] = useState<'GET'|'HEAD'>('GET');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSend = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/http-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResp(data);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">HTTP Client</h2>
        <p className="text-sm text-gray-600">Only GET/HEAD are allowed. Private/loopback targets are blocked.</p>
      </div>
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">URL</label>
            <input className="input" value={url} onChange={e=>setUrl(e.target.value)} />
          </div>
          <div>
            <label className="label">Method</label>
            <select className="input" value={method} onChange={e=>setMethod(e.target.value as any)}>
              <option value="GET">GET</option>
              <option value="HEAD">HEAD</option>
            </select>
          </div>
          <div>
            <button className="btn" onClick={onSend} disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-medium">{resp.status} {resp.statusText}</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="text-gray-500">URL:</span> {resp.url}</p>
            <p><span className="text-gray-500">Time:</span> {resp.timeMs.toFixed(1)} ms</p>
            {resp.bodySize !== null && <p><span className="text-gray-500">Body size:</span> {resp.bodySize} bytes</p>}
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium">Headers</summary>
            <pre className="mt-2 rounded-lg bg-gray-50 p-3 text-xs overflow-auto">{JSON.stringify(resp.headers, null, 2)}</pre>
          </details>
          {resp.bodyPreview && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium">Body preview (first 512 bytes)</summary>
              <pre className="mt-2 rounded-lg bg-gray-50 p-3 text-xs whitespace-pre-wrap">{resp.bodyPreview}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
