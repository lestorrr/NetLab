"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function HttpClientPage() {
  const [url, setUrl] = useState('https://example.com');
  const [method, setMethod] = useState<'GET' | 'HEAD'>('GET');
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
    <ToolLayout title="HTTP Client" description="Only GET/HEAD are allowed. Private/loopback targets are blocked.">
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">URL</label>
            <input className="input" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="label">Method</label>
            <select className="input" value={method} onChange={e => setMethod(e.target.value as any)}>
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
        <ResultCard title={`${resp.status} ${resp.statusText}`} subtitle={`URL: ${resp.url}`} stats={[{ label: 'Time (ms)', value: resp.timeMs.toFixed(1) }, { label: 'Body (bytes)', value: resp.bodySize ?? '—' }]}>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Headers</div>
              <OutputBox value={JSON.stringify(resp.headers, null, 2)} />
            </div>
            {resp.bodyPreview && (
              <div>
                <div className="text-sm text-gray-500">Body preview (first 512 bytes)</div>
                <OutputBox value={resp.bodyPreview} />
              </div>
            )}
          </div>
        </ResultCard>
      )}
    </ToolLayout>
  );
}
