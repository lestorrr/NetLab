"use client"
import { useState, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'

async function computeHash(text: string, algorithm: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest(algorithm, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function HashGeneratorPage() {
    const [input, setInput] = useState('')
    const [hashes, setHashes] = useState<Record<string, string>>({})
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        if (!input) {
            setHashes({})
            return
        }
        const compute = async () => {
            const results: Record<string, string> = {}
            results['SHA-256'] = await computeHash(input, 'SHA-256')
            results['SHA-384'] = await computeHash(input, 'SHA-384')
            results['SHA-512'] = await computeHash(input, 'SHA-512')
            results['SHA-1'] = await computeHash(input, 'SHA-1')
            setHashes(results)
        }
        compute()
    }, [input])

    const copyHash = async (algo: string, hash: string) => {
        await navigator.clipboard.writeText(hash)
        setCopied(algo)
        setTimeout(() => setCopied(null), 1500)
    }

    return (
        <ToolLayout title="Hash Generator" description="Generate cryptographic hashes (SHA-256, SHA-384, SHA-512, SHA-1) for any text input.">
            <div className="card max-w-3xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Text</h2>
                <textarea
                    className="input min-h-[120px] font-mono"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text to hash..."
                />
            </div>

            {Object.keys(hashes).length > 0 && (
                <div className="card max-w-3xl space-y-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Hashes</h2>
                    {Object.entries(hashes).map(([algo, hash]) => (
                        <div key={algo} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{algo}</span>
                                <button
                                    onClick={() => copyHash(algo, hash)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    {copied === algo ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                            <code className="text-xs text-gray-800 break-all font-mono">{hash}</code>
                        </div>
                    ))}
                </div>
            )}
        </ToolLayout>
    )
}
