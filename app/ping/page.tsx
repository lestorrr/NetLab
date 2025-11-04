"use client";
import { useState } from 'react';

export default function TcpPingPage() {
  const [host, setHost] = useState('example.com');
  const [port, setPort] = useState(443);
  const [attempts, setAttempts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  const onPing = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/tcp-ping', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ host, port, attempts }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ping failed');
      setResp(data);
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">TCP Ping</h2>
        <p className="text-sm text-gray-600">ICMP requires raw sockets and isn’t available in serverless; this measures TCP connect time instead.</p>
      </div>
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host</label>
            <input className="input" value={host} onChange={e=>setHost(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Port</label>
              <input className="input" type="number" value={port} onChange={e=>setPort(parseInt(e.target.value,10)||0)} />
            </div>
            <div>
              <label className="label">Attempts</label>
              <input className="input" type="number" value={attempts} onChange={e=>setAttempts(parseInt(e.target.value,10)||1)} />
            </div>
          </div>
          <div>
            <button className="btn" onClick={onPing} disabled={loading}>{loading?'Pinging…':'Ping'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <div className="card max-w-2xl space-y-2">
          <p className="text-sm text-gray-700">Host: {resp.host} ({resp.ip}) • Port {resp.port}</p>
          <p className="text-sm text-gray-700">Received {resp.received} of {resp.attempts}</p>
          {resp.summary && (
            <ul className="grid grid-cols-3 gap-3 text-sm">
              <li><span className="text-gray-500">Min</span> {resp.summary.min.toFixed(1)} ms</li>
              <li><span className="text-gray-500">Avg</span> {resp.summary.avg.toFixed(1)} ms</li>
              <li><span className="text-gray-500">Max</span> {resp.summary.max.toFixed(1)} ms</li>
            </ul>
          )}
          {resp.rtts?.length>0 && <pre className="rounded-lg bg-gray-50 p-3 text-xs">{JSON.stringify(resp.rtts)}</pre>}
        </div>
      )}
    </div>
  );
}
