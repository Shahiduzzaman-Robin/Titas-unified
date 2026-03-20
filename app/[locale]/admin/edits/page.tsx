import { prisma } from "@/lib/prisma"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function PendingEditsPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const pendingEdits = await prisma.student_edits.findMany({
        where: { status: "pending" },
        include: { student: true },
        orderBy: { createdAt: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Pending Profile Edits</h2>
                <Link href={`/${locale}/admin/edits/history`}>
                    <Button variant="outline">View History</Button>
                </Link>
            </div>

            {pendingEdits.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">No pending edits to review.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingEdits.map((edit) => (
                        <Card key={edit.id}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{edit.student.name_en || edit.student.name_bn}</h3>
                                    <p className="text-sm text-gray-500">ID: {edit.student.id} • {edit.student.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(edit.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Link href={`/${locale}/admin/edits/${edit.id}`}>
                                    <Button>Review Changes</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
