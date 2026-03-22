import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { StudentSkeleton } from "@/components/students/StudentSkeleton"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"
import "@/styles/Students.css"

export default function StudentsLoading() {
    return (
        <div className="min-h-screen bg-[#fafbfc]">
            <PublicNav />
            
            <div className="pt-32 pb-12 border-b bg-white border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-64 rounded-xl" />
                            <Skeleton className="h-5 w-48 rounded-lg" />
                        </div>
                        
                        <Skeleton className="h-14 w-full max-w-xl rounded-2xl" />
                        
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <Skeleton className="h-10 w-24 rounded-lg" />
                            <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-10 w-44 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>

            <div className={`container mx-auto px-4 py-12`}>
                <div className="student-grid mt-4">
                    {[...Array(12)].map((_, i) => (
                        <StudentSkeleton key={i} />
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    )
}
