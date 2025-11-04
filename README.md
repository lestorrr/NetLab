# NetLab (Vercel-ready)

Educational networking tools with a web UI and matching Python scripts. Built with Next.js (App Router) and deployable to Vercel.

Only use these tools on systems you own or have explicit permission to test.

## What’s included

Website (deploy to Vercel):
- Port Scanner: TCP connect scan with safety limits and SSRF protection.
- HTTP Client: Safe GET/HEAD with headers and preview.
- TCP Ping: Measure TCP handshake time (ICMP not used).
- Speed Test: Browser download/upload against serverless endpoints.
- Bandwidth Monitor: Guidance only (requires local OS access).
- Simple Web Server: Guidance to run a local server.

Python scripts (local learning):
- `python/port_scanner.py`
- `python/http_client.py`
- `python/tcp_ping.py`
- `python/bandwidth_monitor.py`
- `python/simple_web_server.py`
- `python/speed_test.py`

## Local dev

```powershell
# from project root
npm install
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel

```powershell
# optional: if you don’t have Vercel CLI
npm i -g vercel
vercel login
vercel deploy --prod
```

Notes:
- Serverless functions have execution time and memory limits (keep scans small).
- Private/loopback IPs are blocked to avoid SSRF into internal networks.
- ICMP is not supported in serverless; TCP connect time is used instead.

## Python usage examples

```powershell
# HTTP client
pip install httpx
python .\python\http_client.py https://example.com --method GET

# TCP ping
python .\python\tcp_ping.py example.com 443 --attempts 5

# Port scanner (authorized hosts only)
python .\python\port_scanner.py example.com --ports 22,80,443,8000-8010

# Bandwidth monitor (local)
pip install psutil
python .\python\bandwidth_monitor.py

# Simple static web server
python .\python\simple_web_server.py

# Speed test with your deployed app
python .\python\speed_test.py --download https://<your-domain>/api/speedtest/download?mb=5 --upload https://<your-domain>/api/speedtest/upload
```

## Ethics & legality

- Only test networks and systems you are authorized to test.
- Don’t scan random hosts or perform disruptive activity.
- These tools intentionally include safety limits.
