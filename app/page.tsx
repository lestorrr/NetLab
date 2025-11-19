export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">NetLab by-jhnlstrlclcn</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Legitimate networking tools with a clean UI and matching Python scripts. Please use responsibly—only on systems you own or have explicit permission to test.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-2">Port Scanner</h3>
          <p className="text-sm text-gray-600">Check open TCP ports on a host (safe limits and protections included).</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-2">HTTP Client</h3>
          <p className="text-sm text-gray-600">Perform GET/HEAD requests and inspect response headers and a body preview.</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-2">TCP Ping</h3>
          <p className="text-sm text-gray-600">Measure TCP connect latency to a port (ICMP isn’t available in serverless).</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-2">Speed Test</h3>
          <p className="text-sm text-gray-600">Measure browser download/upload throughput with serverless endpoints.</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-2">Bandwidth Monitor (Local)</h3>
          <p className="text-sm text-gray-600">Monitor your machine’s throughput using a Python script.</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium mb-2">Simple Web Server (Python)</h3>
          <p className="text-sm text-gray-600">Serve a folder locally for quick experiments with standard library.</p>
        </div>
      </div>
    </div>
  );
}
