"use client"
import React, { useState } from 'react'

type Props = {
    value: string
    language?: string
}

export default function OutputBox({ value }: Props) {
    const [copied, setCopied] = useState(false)

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch { }
    }

    return (
        <div className="relative">
            <pre className="bg-white/6 rounded-lg p-3 overflow-auto text-sm font-mono whitespace-pre-wrap text-white/90">{value}</pre>
            <button onClick={onCopy} className="absolute top-2 right-2 btn-secondary text-sm">{copied ? 'Copied' : 'Copy'}</button>
        </div>
    )
}
