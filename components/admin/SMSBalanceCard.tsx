"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Wifi, WifiOff } from "lucide-react"
import { useTranslations } from "next-intl"

interface BalanceData {
    balance: number // Non-masking
    maskBalance: number
    totalSent: number
}

export function SMSBalanceCard({ lastUpdated }: { lastUpdated?: number }) {
    const t = useTranslations('admin.sms')
    const [balance, setBalance] = useState<BalanceData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const fetchBalance = async () => {
        setLoading(true)
        setError(false)
        try {
            // Add timestamp to prevent browser caching
            const res = await fetch(`/api/sms/balance?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setBalance(data)
            } else {
                setError(true)
            }
        } catch (error) {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [lastUpdated])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    SMS Balance
                </CardTitle>
                <div className="flex gap-2">
                    {error ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={fetchBalance} disabled={loading}>
                        <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && !balance ? (
                    <div className="h-20 flex items-center justify-center">
                        <span className="animate-pulse text-xs text-muted-foreground">{t('loading')}</span>
                    </div>
                ) : error ? (
                    <div className="text-xs text-red-500 py-4 text-center">{t('error')}</div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 pt-4 text-center text-sm">
                        <div>
                            <div className="text-2xl font-bold">{balance?.balance || 0}</div>
                            <p className="text-[10px] text-muted-foreground uppercase">{t('nonmask')}</p>
                        </div>
                        <div className="border-l">
                            <div className="text-2xl font-bold">{balance?.maskBalance || 0}</div>
                            <p className="text-[10px] text-muted-foreground uppercase">{t('mask')}</p>
                        </div>
                        <div className="col-span-2 border-t pt-3 mt-2">
                            <div className="text-xl font-bold text-primary">{balance?.totalSent || 0}</div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('totalSent')}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
