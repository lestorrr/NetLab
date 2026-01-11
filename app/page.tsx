import ToolLayout from './components/ToolLayout'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="space-y-14">
        <section className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">Please use<br />RESPONSIBLY</h1>
            <p className="text-white/80">NetLab is for educational, authorized use only. Only scan or test hosts you own or have permission to test.</p>
            <div className="flex items-center gap-4 mt-4">
              <Link href="#" className="btn">GET STARTED</Link>
              <Link href="#" className="btn-secondary">VIEW MORE</Link>
            </div>
          </div>
          <div className="hidden md:block">
            {/* Decorative area — keep empty or add image/svg */}
            <div className="w-full h-64 rounded-xl bg-white/5" />
          </div>
        </section>

        <ToolLayout title="NetLab by Jhnlstrlclcn">
          <section className="text-center space-y-3">
            <p className="text-white/80 max-w-2xl mx-auto">
              Legitimate networking tools using Python.
              <strong className="text-orange-400 block">
                Please use responsibly—only on systems you own or have explicit permission to test.
              </strong>
            </p>
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium mb-2 text-white">Port Scanner</h3>
              <p className="text-white/80">Check open TCP ports on a host (safe limits and protections included).</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-2 text-white">HTTP Client</h3>
              <p className="text-white/80">Perform GET/HEAD requests and inspect response headers and a body preview.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-2 text-white">TCP Ping</h3>
              <p className="text-white/80">Measure TCP connect latency to a port (ICMP isn’t available in serverless).</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-2 text-white">Speed Test</h3>
              <p className="text-white/80">Measure browser download/upload throughput with serverless endpoints.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-2 text-white">Bandwidth Monitor (Local)</h3>
              <p className="text-white/80">Monitor your machine’s throughput using a Python script.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-2 text-white">Simple Web Server (Python)</h3>
              <p className="text-white/80">Serve a folder locally for quick experiments with standard library.</p>
            </div>
          </div>
        </ToolLayout>
      </div>
    </>
  )
}
