export default function BandwidthMonitorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Bandwidth Monitor (Local)</h2>
        <p className="text-sm text-gray-600">Monitoring system-wide bandwidth requires local OS access. Use the Python script below.</p>
      </div>
      <div className="card max-w-2xl space-y-3">
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>Ensure Python 3.9+ is installed.</li>
          <li>Install dependency: <code>pip install psutil</code></li>
          <li>Run the script: <code>python python/bandwidth_monitor.py</code></li>
        </ol>
        <p className="text-sm text-gray-600">The website can’t read your device’s network counters for privacy and browser sandboxing reasons.</p>
      </div>
    </div>
  );
}
