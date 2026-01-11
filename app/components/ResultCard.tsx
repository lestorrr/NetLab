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
        <div className="card relative isolate w-full max-w-4xl overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent blur-3xl" />
                <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-gradient-to-tr from-orange-400/25 via-transparent to-transparent blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    {title && <h3 className="text-xl font-semibold leading-tight text-white">{title}</h3>}
                    {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
                </div>
                {stats?.length ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] lg:min-w-[360px]">
                        {stats.map((s) => (
                            <div
                                key={String(s.label)}
                                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 shadow-inner transition hover:border-white/30 hover:bg-white/10"
                            >
                                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-orange-500/15" />
                                </div>
                                <div className="text-[11px] uppercase tracking-wide text-white/60">{s.label}</div>
                                <div className="mt-1 text-lg font-semibold text-white">{s.value}</div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            {children ? <div className="mt-4 border-t border-white/10 pt-4 lg:mt-6 lg:pt-6">{children}</div> : null}
        </div>
    )
}
