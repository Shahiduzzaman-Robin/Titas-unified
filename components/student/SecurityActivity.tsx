'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Monitor, Globe, ChevronRight, ChevronLeft, LogIn, LogOut, KeyRound } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
    id: number;
    action: string;
    description: string;
    ipAddress: string;
    location: string;
    userAgent: string;
    createdAt: string;
}

const actionConfig: Record<string, { icon: any, color: string, dotColor: string }> = {
    login: { icon: LogIn, color: 'text-emerald-500', dotColor: 'border-emerald-500' },
    logout: { icon: LogOut, color: 'text-rose-500', dotColor: 'border-rose-500' },
    password_change: { icon: KeyRound, color: 'text-amber-500', dotColor: 'border-amber-500' },
    default: { icon: Shield, color: 'text-indigo-500', dotColor: 'border-indigo-500' }
};

const SecurityActivity = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 30;

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/student/activity');
                const data = await res.json();
                if (data.activities) {
                    setActivities(data.activities);
                }
            } catch (error) {
                console.error('Failed to fetch security activity', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const getConfig = (action: string) => actionConfig[action] || actionConfig.default;

    const getDeviceType = (ua: string) => {
        if (!ua) return 'Unknown Device';
        
        let os = 'Unknown OS';
        if (ua.includes('Windows') || ua.includes('Win')) os = 'Windows';
        if (ua.includes('Mac')) os = 'macOS';
        if (ua.includes('Android')) os = 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';

        let browser = '';
        if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';

        const formFactor = ua.includes('Mobi') ? 'Mobile' : ua.includes('Tablet') ? 'Tablet' : 'Desktop';
        
        if (os !== 'Unknown OS' || browser) {
            return `${browser || 'Browser'} on ${os} (${formFactor})`;
        }
        
        return `${formFactor} Device`;
    };

    if (loading) {
        return (
            <Card className="dashboard-card animate-pulse">
                <CardContent className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-full" />
                        <div className="w-32 h-4 bg-slate-100 rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dashboard-card flex flex-col h-auto">
            <CardHeader className="border-b border-slate-100/60 pb-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-black text-slate-900">Account Security & Activity</CardTitle>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 0}
                                className="h-8 w-8 rounded-md"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-[10px] font-black w-8 text-center text-slate-500">
                                {currentPage + 1}/{totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages - 1}
                                className="h-8 w-8 rounded-md"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-8 flex-1 flex flex-col min-h-[300px]">
                <div className="space-y-0 flex-1 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-0 pb-4"
                        >
                            {activities.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent security activity found.</p>
                                </div>
                            ) : (
                                currentActivities.map((activity) => {
                                    const config = getConfig(activity.action);
                                    const Icon = config.icon;
                                    return (
                                        <div key={activity.id} className="timeline-item group">
                                            <div className={cn("timeline-dot group-hover:scale-125 transition-transform", config.dotColor)} />
                                            <div className="bg-white/50 border border-slate-100/80 p-5 rounded-2xl group-hover:bg-white group-hover:shadow-lg group-hover:shadow-indigo-500/5 transition-all">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={cn("w-4 h-4", config.color)} />
                                                        <p className="text-sm font-black text-slate-900 capitalize">
                                                            {activity.action.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                                        <Monitor className="w-3.5 h-3.5" />
                                                        {getDeviceType(activity.userAgent)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                                        <Globe className="w-3.5 h-3.5" />
                                                        {activity.location && activity.location !== 'Unknown' 
                                                            ? activity.location 
                                                            : 'Unknown Location'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200">
                                                        IP: {activity.ipAddress || 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};

export default SecurityActivity;
