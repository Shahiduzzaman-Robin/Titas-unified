"use client"

import { useTranslations } from "next-intl"
import { Search, Building2, Calendar, Home, Droplets, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function StudentFiltersLoading() {
    const t = useTranslations('public.students')

    return (
        <div className="max-w-7xl mx-auto mb-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h2 className="text-2xl font-light text-gray-900 tracking-tight flex items-center gap-3">
                    {t('title')}
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <span className="font-bold text-gray-900">...</span>
                    </span>
                </h2>

                <div className="relative w-full md:w-96 opacity-60 pointer-events-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        disabled
                        className="pl-9 h-10 bg-gray-50 border-transparent rounded-full text-sm"
                    />
                </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3 opacity-60 pointer-events-none">
                {/* Department Filter */}
                <div className="w-[200px] h-9 flex items-center gap-2 px-3 border border-gray-200 bg-white rounded-full text-xs text-gray-400">
                    <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{t('allDepartments')}</span>
                </div>

                {/* Session Filter */}
                <div className="w-[160px] h-9 flex items-center gap-2 px-3 border border-gray-200 bg-white rounded-full text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{t('allSessions')}</span>
                </div>

                {/* Hall Filter */}
                <div className="w-[180px] h-9 flex items-center gap-2 px-3 border border-gray-200 bg-white rounded-full text-xs text-gray-400">
                    <Home className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{t('allHalls')}</span>
                </div>

                {/* Blood Group Filter */}
                <div className="w-[140px] h-9 flex items-center gap-2 px-3 border border-gray-200 bg-white rounded-full text-xs text-gray-400">
                    <Droplets className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                    <span>{t('bloodGroup')}</span>
                </div>

                {/* Upazila Filter */}
                <div className="w-[160px] h-9 flex items-center gap-2 px-3 border border-gray-200 bg-white rounded-full text-xs text-gray-400">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{t('allUpazilas')}</span>
                </div>

                {/* Train Animation - Keep full opacity as it's just visual */}
                <div className="flex-1 ml-auto relative h-9 overflow-hidden bg-slate-50/50 rounded-full border border-slate-100 opacity-100">
                    {/* Simple Track */}
                    <div className="absolute bottom-2 left-0 w-full h-[1px] bg-slate-200"></div>
                    <div className="absolute bottom-2 left-0 w-full flex justify-between px-1">
                        {[...Array(40)].map((_, i) => (
                            <div key={i} className="w-[1px] h-1.5 bg-slate-200"></div>
                        ))}
                    </div>

                    {/* SVG Train */}
                    <div className="absolute bottom-0.5 left-0 animate-train">
                        <img src="/train.svg" alt="Train" className="h-7 w-auto" />
                    </div>
                </div>
            </div>
        </div>
    )
}
