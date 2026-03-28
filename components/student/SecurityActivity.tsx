'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, Clock, Monitor, Globe, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

interface Activity {
    id: number;
    action: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

const SecurityActivity = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login': return <Shield className="w-5 h-5 text-emerald-500" />;
            case 'logout': return <Clock className="w-5 h-5 text-slate-400" />;
            case 'password_change': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
            default: return <Clock className="w-5 h-5 text-indigo-500" />;
        }
    };

    const getDeviceType = (ua: string) => {
        if (!ua) return 'Unknown Device';
        if (ua.includes('Mobi')) return 'Mobile Device';
        if (ua.includes('Tablet')) return 'Tablet';
        return 'Desktop Computer';
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
        <Card className="dashboard-card overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                        Account Security & Activity
                    </CardTitle>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-slate-100">
                        {activities.length} Recent Events
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                    {activities.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No recent security activity found.</p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-slate-50/80 transition-all group flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    {getActionIcon(activity.action)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-slate-900 truncate capitalize">
                                            {activity.action.replace('_', ' ')}
                                        </p>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <Monitor className="w-3.5 h-3.5" />
                                            {getDeviceType(activity.userAgent)}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <Globe className="w-3.5 h-3.5" />
                                            {activity.ipAddress || 'Unknown IP'}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <div className={cn("w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center", className)}>
        <Shield className="w-4 h-4" />
    </div>
);

export default SecurityActivity;
