import React from 'react'

type Props = {
    title: string
    description?: string
    children: React.ReactNode
}

export default function ToolLayout({ title, description, children }: Props) {
    return (
        <div className="space-y-6 container-page">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    )
}
