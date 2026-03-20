"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SMSLog {
    id: number
    phone: string
    message: string
    status: string
    sentAt: string
    student: {
        name_en: string
        name_bn: string | null
    } | null
}

export function SMSLogsTable() {
    const [logs, setLogs] = useState<SMSLog[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    const fetchLogs = async (pageNum: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/sms/logs?page=${pageNum}&limit=10`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(page)
    }, [page])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'default' // green-ish usually or default primary
            case 'delivered': return 'secondary' // blue-ish
            case 'failed': return 'destructive' // red
            default: return 'outline'
        }
    }

    return (
        <div className="space-y-4">
            {/* Card View for All Devices */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No logs found</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between sm:justify-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            {log.student ? (
                                                <div>
                                                    <div className="font-medium text-sm sm:text-base">{log.student.name_en}</div>
                                                    {log.student.name_bn && <div className="text-xs text-muted-foreground font-bengali">{log.student.name_bn}</div>}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">System</span>
                                            )}
                                        </div>
                                        <Badge variant={getStatusColor(log.status) as any} className="shrink-0 sm:hidden">
                                            {log.status}
                                        </Badge>
                                    </div>

                                    <div className="mt-2 space-y-1 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="font-medium min-w-[60px]">Phone:</span>
                                            <span>{log.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="font-medium min-w-[60px]">Date:</span>
                                            <span>{new Date(log.sentAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Status Badge (Desktop) */}
                                <Badge variant={getStatusColor(log.status) as any} className="hidden sm:block shrink-0">
                                    {log.status}
                                </Badge>
                            </div>

                            {/* Message */}
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                                    {log.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
