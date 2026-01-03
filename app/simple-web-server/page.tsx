import ToolLayout from '../components/ToolLayout'

export default function SimpleWebServerPage() {
  return (
    <ToolLayout title="Simple Web Server (Python)" description="This site uses serverless functions. For a traditional long-running server, use the script below.">
      <div className="card max-w-2xl">
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>Run <code>python python/simple_web_server.py</code></li>
          <li>Open <code>http://127.0.0.1:8000</code></li>
        </ol>
        <p className="text-sm text-gray-600 mt-3">It serves the current directory with Python’s standard library—great for quick tests.</p>
      </div>
    </ToolLayout>
  );
}
