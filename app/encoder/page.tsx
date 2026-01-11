"use client"
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'

type EncodingType = 'base64' | 'url' | 'hex' | 'html'

function encode(text: string, type: EncodingType): string {
    try {
        switch (type) {
            case 'base64': return btoa(unescape(encodeURIComponent(text)))
            case 'url': return encodeURIComponent(text)
            case 'hex': return Array.from(new TextEncoder().encode(text)).map(b => b.toString(16).padStart(2, '0')).join('')
            case 'html': return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c))
            default: return text
        }
    } catch { return 'Encoding error' }
}

function decode(text: string, type: EncodingType): string {
    try {
        switch (type) {
            case 'base64': return decodeURIComponent(escape(atob(text)))
            case 'url': return decodeURIComponent(text)
            case 'hex': return text.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || ''
            case 'html': return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[m] || m))
            default: return text
        }
    } catch { return 'Decoding error' }
}

export default function EncoderPage() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [encoding, setEncoding] = useState<EncodingType>('base64')
    const [copied, setCopied] = useState(false)

    const handleEncode = () => setOutput(encode(input, encoding))
    const handleDecode = () => setOutput(decode(input, encoding))
    const handleSwap = () => { setInput(output); setOutput(input) }
    const handleCopy = async () => {
        await navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <ToolLayout title="Encoder / Decoder" description="Encode and decode text using Base64, URL encoding, Hexadecimal, and HTML entities.">
            <div className="card max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <label className="text-sm font-medium text-gray-700">Encoding Type:</label>
                    <select
                        className="input w-auto"
                        value={encoding}
                        onChange={(e) => setEncoding(e.target.value as EncodingType)}
                    >
                        <option value="base64">Base64</option>
                        <option value="url">URL Encoding</option>
                        <option value="hex">Hexadecimal</option>
                        <option value="html">HTML Entities</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="label">Input</label>
                        <textarea
                            className="input min-h-[100px] font-mono text-sm"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to encode or decode..."
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="btn btn-primary" onClick={handleEncode}>Encode →</button>
                        <button className="btn btn-secondary" onClick={handleDecode}>← Decode</button>
                        <button className="btn btn-ghost" onClick={handleSwap}>↕ Swap</button>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="label mb-0">Output</label>
                            {output && (
                                <button onClick={handleCopy} className="text-xs text-blue-600 hover:text-blue-800">
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                        <textarea
                            className="input min-h-[100px] font-mono text-sm bg-gray-50"
                            value={output}
                            readOnly
                            placeholder="Result will appear here..."
                        />
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
