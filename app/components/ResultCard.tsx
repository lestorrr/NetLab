import React from 'react'

type Stat = { label: string; value: React.ReactNode }

type Props = {
    title?: string
    subtitle?: string
    stats?: Stat[]
    children?: React.ReactNode
}

export default function ResultCard({ title, subtitle, stats, children }: Props) {
    return (
        <div className="card max-w-3xl">
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            {stats && (
                <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    {stats.map((s) => (
                        <div key={String(s.label)} className="p-3 rounded-md bg-gray-50">
                            <div className="text-xs text-gray-500">{s.label}</div>
                            <div className="font-medium mt-1">{s.value}</div>
                        </div>
                    ))}
                </div>
            )}
            {children && <div className="mt-3">{children}</div>}
        </div>
    )
}
