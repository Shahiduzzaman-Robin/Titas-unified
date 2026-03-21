"use client"

import React, { useState, useCallback, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Search, Building2, Calendar, Home, Droplets, MapPin, X, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { StudentCard } from '@/components/students/StudentCard'
import { StudentSkeleton } from '@/components/students/StudentSkeleton'
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"
import "@/styles/Students.css"

interface Student {
    id: number
    prefix: string
    name_en: string | null
    name_bn: string | null
    address_en: string | null
    address_bn: string | null
    student_session: string | null
    department: string | null
    hall: string | null
    upazila: string | null
    mobile: string | null
    email: string | null
    blood_group: string | null
    gender: string
    image_path: string | null
    job_position: string | null
    job_designation: string | null
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface AvailableFilters {
    sessions: string[];
    departments: string[];
    halls: string[];
    upazilas: string[];
    bloodGroups: string[];
    genders: string[];
}

interface Maps {
    sessionMap: Record<string, string>;
    departmentMap: Record<string, string>;
    hallMap: Record<string, string>;
    upazilaMap: Record<string, string>;
}

interface StudentDirectoryClientProps {
    initialStudents: Student[];
    pagination: PaginationInfo;
    filters: AvailableFilters;
    maps: Maps;
    currentFilters: Record<string, string>;
}

export default function StudentDirectoryClient({
    initialStudents,
    pagination,
    filters,
    maps,
    currentFilters
}: StudentDirectoryClientProps) {
    const t = useTranslations('public.students')
    const locale = useLocale()
    const isBengali = locale === 'bn'
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Local state for immediate UI feedback (e.g. search input)
    const [searchInput, setSearchInput] = useState(currentFilters.search || '')

    // Check if any filters are active (excluding page)
    const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => {
        if (key === 'page') return false;
        if (key === 'blood_group' || key === 'gender') return value && value !== 'all';
        return value && value !== '';
    });

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString())
            
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '' || value === 'all') {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, value)
                }
            })

            // Reset to page 1 on any filter change (unless specifically updating page)
            if (!params.page) {
                newSearchParams.delete('page')
            }

            return newSearchParams.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (key: string, value: string) => {
        const query = createQueryString({ [key]: value })
        startTransition(() => {
            router.push(`${pathname}?${query}`, { scroll: false })
        })
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        handleFilterChange('search', searchInput)
    }

    const clearFilters = () => {
        setSearchInput('')
        startTransition(() => {
            router.push(pathname, { scroll: false })
        })
    }

    return (
        <div className="students-directory-modern min-h-screen bg-white">
            <PublicNav />

            {/* Premium Header/Controls */}
            <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Title & Stats */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight bn-text">
                                    {isBengali ? 'শিক্ষার্থী তালিকা' : 'Student Directory'}
                                </h1>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {pagination.total} {isBengali ? 'জন শিক্ষার্থী সচল' : 'Members Active'}
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-slate-900 transition-colors" />
                            <Input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-12 h-14 bg-gray-50 border-none focus:ring-2 focus:ring-slate-900/5 transition-all rounded-2xl text-base bn-text"
                            />
                            {isPending && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                </div>
                            )}
                        </form>

                        {/* Pagination Buttons (Top) */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleFilterChange('page', (pagination.page - 1).toString())}
                                disabled={pagination.page <= 1 || isPending}
                                className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all text-slate-600"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="text-sm font-bold text-slate-900 px-4 py-2 bg-gray-50 rounded-lg">
                                {pagination.page} / {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => handleFilterChange('page', (pagination.page + 1).toString())}
                                disabled={pagination.page >= pagination.totalPages || isPending}
                                className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all text-slate-600"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar (disabled for debugging) */}
                    <div className="flex flex-wrap items-center gap-3 mt-8">
                        <span className="text-slate-400">Filters disabled for debugging</span>
                        {/* Clear Button - Only show if filters are active */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="h-10 px-4 rounded-xl flex items-center gap-2 text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all font-bold text-sm ml-auto animate-in fade-in zoom-in duration-200"
                            >
                                <X size={16} />
                                {isBengali ? 'সব রিমুভ করুন' : 'Clear All'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Grid */}
            <div className={`container mx-auto px-4 py-12`}>
                <div className="student-grid mt-4">
                    {isPending ? (
                        // Show skeletons during transition
                        [...Array(6)].map((_, i) => (
                            <StudentSkeleton key={i} />
                        ))
                    ) : (
                        initialStudents.map(student => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                sessionMap={maps.sessionMap}
                                departmentMap={maps.departmentMap}
                                hallMap={maps.hallMap}
                                upazilaMap={maps.upazilaMap}
                            />
                        ))
                    )}
                </div>

                {/* Empty State */}
                {initialStudents.length === 0 && !isPending && (
                    <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 bn-text">
                            {isBengali ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No students found'}
                        </h3>
                        <p className="text-slate-500">
                            {isBengali ? 'আপনার সাজানো ফিল্টার অনুযায়ী কেউ মিলেনি' : 'Try adjusting your search or filters'}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Pagination */}
            {pagination.totalPages > 1 && (
                <div className="container mx-auto px-4 pb-20">
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => handleFilterChange('page', (pagination.page - 1).toString())}
                            disabled={pagination.page <= 1 || isPending}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold disabled:opacity-30 hover:scale-105 transition-all shadow-lg active:scale-95"
                        >
                            <ChevronLeft size={20} />
                            {isBengali ? 'পূর্ববর্তী' : 'Previous'}
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                                if (pagination.page > pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                if (pageNum <= 0) return null;
                                if (pageNum > pagination.totalPages) return null;
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handleFilterChange('page', pageNum.toString())}
                                        className={`w-12 h-12 rounded-2xl font-bold transition-all ${
                                            pagination.page === pageNum 
                                            ? 'bg-slate-900 text-white scale-110 shadow-md' 
                                            : 'bg-gray-50 text-slate-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handleFilterChange('page', (pagination.page + 1).toString())}
                            disabled={pagination.page >= pagination.totalPages || isPending}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold disabled:opacity-30 hover:scale-105 transition-all shadow-lg active:scale-95"
                        >
                            {isBengali ? 'পরবর্তী' : 'Next'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
