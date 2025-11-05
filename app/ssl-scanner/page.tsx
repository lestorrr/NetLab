"use client";
import { useState } from 'react';

export default function SSLScannerPage() {
  const [host, setHost] = useState('example.com');
  const [port, setPort] = useState(443);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  const onScan = async () => {
    setLoading(true); setError(null); setResp(null);
    try {
      const res = await fetch('/api/ssl-scan', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ host, port })});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResp(data);
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">SSL/TLS Scanner</h2>
        <p className="text-sm text-gray-600">Fetch TLS protocol, cipher, ALPN, and certificate details. Authorized use only.</p>
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
              <input className="input" type="number" value={port} onChange={e=>setPort(parseInt(e.target.value,10)||443)} />
            </div>
          </div>
          <div>
            <button className="btn" onClick={onScan} disabled={loading}>{loading?'Scanning…':'Scan'}</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {resp && (
        <div className="card max-w-2xl space-y-2 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-gray-500">Protocol</div>
              <div className="font-medium">{resp.protocol || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">ALPN</div>
              <div className="font-medium">{resp.alpn || '—'}</div>
            </div>
          </div>
          <div>
            <div className="text-gray-500">Cipher</div>
            <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.cipher, null, 2)}</pre>
          </div>
          <div>
            <div className="text-gray-500">Certificate</div>
            <pre className="bg-gray-50 rounded-lg p-3 overflow-auto">{JSON.stringify(resp.certificate, null, 2)}</pre>
          </div>
          <div className="text-gray-500">Handshake time</div>
          <div className="font-medium">{resp.tookMs?.toFixed?.(1)} ms</div>
        </div>
      )}
    </div>
  );
}
