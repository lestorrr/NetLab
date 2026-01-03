"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function TcpPingPage() {
  const [host, setHost] = useState('example.com');
  const [port, setPort] = useState(443);
  const [attempts, setAttempts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onPing = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/tcp-ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host, port, attempts }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ping failed');
      setResp(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <ToolLayout title="TCP Ping" description="ICMP requires raw sockets and isn’t available in serverless; this measures TCP connect time instead.">
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host</label>
            <input className="input" value={host} onChange={e => setHost(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Port</label>
              <input className="input" type="number" value={port} onChange={e => setPort(parseInt(e.target.value, 10) || 0)} />
            </div>
            <div>
              <label className="label">Attempts</label>
              <input className="input" type="number" value={attempts} onChange={e => setAttempts(parseInt(e.target.value, 10) || 1)} />
            </div>
          </div>
          <div>
            <button className="btn" onClick={onPing} disabled={loading}>{loading ? 'Pinging…' : 'Ping'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <ResultCard title={`Host: ${resp.host} (${resp.ip})`} subtitle={`Port ${resp.port} — Received ${resp.received} / ${resp.attempts}`} stats={resp.summary ? [{ label: 'Min (ms)', value: resp.summary.min.toFixed(1) }, { label: 'Avg (ms)', value: resp.summary.avg.toFixed(1) }, { label: 'Max (ms)', value: resp.summary.max.toFixed(1) }] : undefined}>
          {resp.rtts?.length > 0 && <OutputBox value={JSON.stringify(resp.rtts, null, 2)} />}
        </ResultCard>
      )}
    </ToolLayout>
  );
}
