import { NextRequest } from 'next/server'
import net from 'net'
import dns from 'dns/promises'
import { checkRateLimit, checkAllowDeny } from '../_lib/safeguards'

type GrabOptions = {
    host: string
    port: number
    hint?: string
    timeoutMs?: number
    maxBytes?: number
}

function buildProbe(hint?: string, host?: string) {
    const h = String(hint || '').toLowerCase()
    if (h.includes('http')) return `HEAD / HTTP/1.0\r\nHost: ${host || ''}\r\nConnection: close\r\n\r\n`
    if (h.includes('smtp')) return `EHLO netlab\r\n`
    if (h.includes('pop')) return `QUIT\r\n`
    if (h.includes('imap')) return `a001 CAPABILITY\r\n`
    if (h.includes('redis')) return `PING\r\n`
    if (h.includes('telnet')) return ``
    return ''
}

async function grabBanner({ host, port, hint, timeoutMs = 1500, maxBytes = 4096 }: GrabOptions): Promise<{ banner: string; bytes: number; elapsedMs: number } | null> {
    return new Promise((resolve) => {
        const start = performance.now()
        const socket = new net.Socket()
        let total = 0
        const chunks: Buffer[] = []
        let done = false

        const finish = () => {
            if (done) return
            done = true
            socket.destroy()
            const elapsedMs = performance.now() - start
            const buf = Buffer.concat(chunks as unknown as Uint8Array[])
            const banner = buf.toString('utf8')
            resolve({ banner, bytes: buf.length, elapsedMs })
        }

        socket.setTimeout(timeoutMs, finish)
        socket.once('error', () => resolve(null))
        socket.connect(port, host, () => {
            const probe = buildProbe(hint, host)
            if (probe) socket.write(probe)
        })

        socket.on('data', (d) => {
            if (done) return
            chunks.push(d)
            total += d.length
            if (total >= maxBytes) finish()
        })
        socket.once('end', finish)
        socket.once('close', finish)
    })
}

export async function POST(req: NextRequest) {
    try {
        const rl = checkRateLimit(req, 8, 60)
        if (rl) return rl
        const body = await req.json()
        const host = String(body.host || '').trim()
        const port = Number(body.port || 80)
        const hint = String(body.hint || '').trim()
        if (!host) return Response.json({ error: 'Host is required' }, { status: 400 })
        if (!Number.isFinite(port) || port < 1 || port > 65535) return Response.json({ error: 'Invalid port' }, { status: 400 })

        const addrs = await dns.lookup(host, { all: true })
        const ip = addrs[0]?.address
        if (!ip) return Response.json({ error: 'Unable to resolve host' }, { status: 400 })
        const deny = checkAllowDeny(req, ip) || checkAllowDeny(req, host)
        if (deny) return deny

        const res = await grabBanner({ host, port, hint })
        if (!res) return Response.json({ error: 'No banner received' }, { status: 504 })
        return Response.json({ host, ip, port, hint, ...res })
    } catch (e: any) {
        return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 })
    }
}
