import { prisma } from "@/lib/prisma"
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, User } from "lucide-react"

export default async function EditHistoryPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const edits = await prisma.student_edits.findMany({
        where: {
            status: {
                in: ['approved', 'rejected']
            }
        },
        include: {
            student: {
                select: {
                    id: true,
                    prefix: true,
                    name_en: true,
                    name_bn: true,
                    email: true
                }
            },
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { reviewedAt: 'desc' },
        take: 100 // Limit to last 100 edits
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/admin/edits`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Pending
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit History</h2>
            </div>

            {edits.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">No edit history found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {edits.map((edit) => (
                        <Card key={edit.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg">
                                                {edit.student.name_en || edit.student.name_bn}
                                            </h3>
                                            <Badge variant={edit.status === 'approved' ? 'default' : 'destructive'}>
                                                {edit.status === 'approved' ? (
                                                    <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3 mr-1" /> Rejected</>
                                                )}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-gray-500">
                                            Student ID: {edit.student.prefix}-{edit.student.id} • {edit.student.email}
                                        </p>

                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                            <span>Submitted: {new Date(edit.createdAt).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>Reviewed: {edit.reviewedAt ? new Date(edit.reviewedAt).toLocaleString() : 'N/A'}</span>
                                        </div>

                                        {/* Admin Info */}
                                        <div className="mt-3 flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                Reviewed by:{' '}
                                                {edit.admin ? (
                                                    <span className="font-medium text-gray-900">
                                                        {edit.admin.name} ({edit.admin.email})
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">System Admin</span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Rejection Reason */}
                                        {edit.status === 'rejected' && edit.reviewNote && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <p className="text-sm text-red-900">
                                                    <span className="font-semibold">Rejection Reason:</span> {edit.reviewNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <Link href={`/${locale}/admin/edits/${edit.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
