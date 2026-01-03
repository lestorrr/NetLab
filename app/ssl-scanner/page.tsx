"use client";
import { useState } from 'react';
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'
import OutputBox from '../components/OutputBox'

export default function SSLScannerPage() {
  const [host, setHost] = useState('example.com');
  const [port, setPort] = useState(443);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onScan = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/ssl-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host, port }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResp(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <ToolLayout title="SSL/TLS Scanner" description="Fetch TLS protocol, cipher, ALPN, and certificate details. Authorized use only.">
      <div className="card max-w-2xl">
        <div className="grid gap-4">
          <div>
            <label className="label">Host</label>
            <input className="input" value={host} onChange={e => setHost(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Port</label>
              <input className="input" type="number" value={port} onChange={e => setPort(parseInt(e.target.value, 10) || 443)} />
            </div>
          </div>
          <div>
            <button className="btn" onClick={onScan} disabled={loading}>{loading ? 'Scanning…' : 'Scan'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <ResultCard title={`TLS info for ${host}`} stats={[{ label: 'Protocol', value: resp.protocol || '—' }, { label: 'ALPN', value: resp.alpn || '—' }, { label: 'Handshake (ms)', value: resp.tookMs?.toFixed?.(1) || '—' }]}>
          <div className="mt-2">
            <div className="text-gray-500">Cipher</div>
            <OutputBox value={JSON.stringify(resp.cipher, null, 2)} />
          </div>
          <div className="mt-3">
            <div className="text-gray-500">Certificate</div>
            <OutputBox value={JSON.stringify(resp.certificate, null, 2)} />
          </div>
        </ResultCard>
      )}
    </ToolLayout>
  );
}
