"use client"

import { useEffect, useRef, useState } from "react"
import { Eye } from "lucide-react"

interface ViewCounterProps {
    slug: string
    initialViews: number
}

export default function ViewCounter({ slug, initialViews }: ViewCounterProps) {
    const [views, setViews] = useState(initialViews)
    const hasCounted = useRef(false)

    useEffect(() => {
        if (hasCounted.current) return
        hasCounted.current = true

        const incrementView = async () => {
            try {
                const res = await fetch(`/api/blog/posts/${slug}/view`, {
                    method: 'POST'
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.views != null) {
                        setViews(data.views)
                    }
                }
            } catch (error) {
                console.error("Failed to increment view", error)
            }
        }

        incrementView()
    }, [slug])

    return (
        <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-900" />
            {views} VIEWS
        </div>
    )
}
