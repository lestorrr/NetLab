import React from 'react'

type Props = {
    title: string
    description?: string
    children: React.ReactNode
}

export default function ToolLayout({ title, description, children }: Props) {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {description && (
                    <p className="text-gray-600 max-w-2xl">{description}</p>
                )}
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    )
}
