import React from 'react'

type Stat = { label: string; value: React.ReactNode; status?: 'success' | 'warning' | 'error' | 'info' }

type Props = {
    title?: string
    subtitle?: string
    stats?: Stat[]
    children?: React.ReactNode
    status?: 'success' | 'warning' | 'error' | 'info' | 'loading'
}

const statusConfig = {
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: '✓', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '!', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: '✕', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'i', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    loading: { bg: 'bg-gray-50', border: 'border-gray-200', icon: '○', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
}

export default function ResultCard({ title, subtitle, stats, children, status }: Props) {
    const config = status ? statusConfig[status] : null

    return (
        <div className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 animate-slide-up ${config ? `${config.bg} ${config.border}` : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-start gap-4">
                {status && config && (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center ${status === 'loading' ? 'animate-pulse-subtle' : ''}`}>
                        <span className={`font-bold ${config.iconColor}`}>{config.icon}</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            {stats && stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-scale-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Children */}
            {children && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    )
}
