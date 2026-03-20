import { prisma } from "@/lib/prisma"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    CheckCircle,
    XCircle,
    User,
    Calendar,
    Monitor,
    MapPin,
    FileEdit,
    UserCheck,
    UserX
} from "lucide-react"

export default async function AdminActivityPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const activities = await prisma.admin_activity_logs.findMany({
        include: {
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            student: {
                select: {
                    id: true,
                    prefix: true,
                    name_en: true,
                    name_bn: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Last 100 activities
    })

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'approve_registration':
                return <UserCheck className="w-4 h-4 text-green-600" />
            case 'reject_registration':
                return <UserX className="w-4 h-4 text-red-600" />
            case 'approve_edit':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'reject_edit':
                return <XCircle className="w-4 h-4 text-red-600" />
            case 'update_student':
                return <FileEdit className="w-4 h-4 text-blue-600" />
            default:
                return <User className="w-4 h-4 text-gray-600" />
        }
    }

    const getActionBadge = (action: string) => {
        const isApproval = action.includes('approve')
        const isRejection = action.includes('reject')

        if (isApproval) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approval</Badge>
        if (isRejection) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejection</Badge>
        return <Badge variant="secondary">Action</Badge>
    }

    const formatAction = (action: string) => {
        return action
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Activity Log</h2>
                    <p className="text-gray-500 mt-1">Track all administrative actions and changes</p>
                </div>
                <div className="text-sm text-gray-500">
                    Showing last {activities.length} activities
                </div>
            </div>

            {activities.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500 text-lg">No activity logs found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {activities.map((activity) => (
                        <Card key={activity.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="mt-1">
                                        {getActionIcon(activity.action)}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {formatAction(activity.action)}
                                            </h3>
                                            {getActionBadge(activity.action)}
                                        </div>

                                        {/* Description */}
                                        {activity.description && (
                                            <p className="text-sm text-gray-700 mb-3">
                                                {activity.description}
                                            </p>
                                        )}

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                            {/* Admin */}
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {activity.admin ? (
                                                        <span className="font-medium text-gray-900">
                                                            {activity.admin.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">System Admin</span>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Student */}
                                            {activity.student && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    <Link
                                                        href={`/${locale}/admin/students`}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        {activity.student.prefix}-{activity.student.id}
                                                    </Link>
                                                    <span className="text-gray-600">
                                                        ({activity.student.name_en || activity.student.name_bn})
                                                    </span>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* IP Address */}
                                            {activity.ipAddress && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span className="text-gray-600 font-mono">
                                                        {activity.ipAddress}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadata (if exists) */}
                                        {activity.metadata && (
                                            <details className="mt-3">
                                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                                    View Details
                                                </summary>
                                                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(activity.metadata, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
