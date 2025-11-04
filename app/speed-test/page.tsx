"use client";
import { useEffect, useState } from 'react';

export default function SpeedTestPage() {
  const [downMbps, setDownMbps] = useState<number | null>(null);
  const [upMbps, setUpMbps] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  const testDownload = async (mb = 5) => {
    const url = `/api/speedtest/download?mb=${mb}&_=${Date.now()}`;
    const started = performance.now();
    const res = await fetch(url, { cache: 'no-store' });
    const reader = res.body!.getReader();
    let bytes = 0;
    while(true){
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value?.length || 0;
    }
    const ms = performance.now() - started;
    const mbps = (bytes * 8) / (ms / 1000) / 1_000_000;
    setDownMbps(mbps);
  };

  const testUpload = async (mb = 5) => {
    const bytes = mb * 1024 * 1024;
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    const started = performance.now();
    const res = await fetch('/api/speedtest/upload', { method: 'POST', body: buf });
    const data = await res.json();
    const ms = performance.now() - started;
    const mbps = (bytes * 8) / (ms / 1000) / 1_000_000;
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    setUpMbps(mbps);
  };

  const run = async () => {
    setRunning(true); setDownMbps(null); setUpMbps(null);
    try {
      await testDownload(5);
      await testUpload(5);
    } catch (e) {
      console.error(e);
    } finally { setRunning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Speed Test</h2>
        <p className="text-sm text-gray-600">Measures browser ↔ server throughput. Results depend on your network/ISP and serverless region.</p>
      </div>
      <div className="flex gap-3">
        <button className="btn" onClick={run} disabled={running}>{running?'Running…':'Run 5 MB Down/Up'}</button>
        <button className="btn-secondary" onClick={()=>{setDownMbps(null); setUpMbps(null);}} disabled={running}>Reset</button>
      </div>
      <div className="card max-w-md">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Download</div>
            <div className="text-2xl font-semibold">{downMbps ? `${downMbps.toFixed(2)} Mbps` : '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Upload</div>
            <div className="text-2xl font-semibold">{upMbps ? `${upMbps.toFixed(2)} Mbps` : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
