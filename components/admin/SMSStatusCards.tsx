"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCcw, CreditCard, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"

interface BalanceData {
    balance: number // Non-masking
    maskBalance: number
    totalSent: number
}

export function SMSStatusCards({ lastUpdated }: { lastUpdated?: number }) {
    const t = useTranslations('admin.sms')
    const [balance, setBalance] = useState<BalanceData | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchBalance = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/sms/balance?t=${Date.now()}`)
            if (res.ok) {
                const data = await res.json()
                setBalance(data)
            }
        } catch (error) {
            console.error("Failed to fetch balance")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [lastUpdated])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                        <CreditCard size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">নন-মাস্কিং ব্যালেন্স</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-800">{balance?.balance || 0}</span>
                            <span className="text-sm font-semibold text-slate-600">SMS</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-500">
                        <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">মাস্কিং ব্যালেন্স</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-800">{balance?.maskBalance || 0}</span>
                            <span className="text-sm font-semibold text-slate-600">SMS</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
