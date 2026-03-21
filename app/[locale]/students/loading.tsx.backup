import { Skeleton } from "@/components/ui/skeleton"
import { PublicNav } from "@/components/PublicNav"
import { StudentFiltersLoading } from "@/components/students/StudentFiltersLoading"

export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <PublicNav />

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Search and Filters */}
                <StudentFiltersLoading />

                {/* Student Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="p-6 flex flex-col items-center border-b border-gray-50 bg-gray-50/30">
                                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
