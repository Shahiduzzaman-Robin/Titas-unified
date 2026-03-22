import React from 'react'

export function StudentSkeleton() {
    return (
        <div className="student-card-skeleton animate-in fade-in duration-500">
            <div className="card-header-profile">
                <div className="avatar-placeholder shimmer-premium rounded-full w-[60px] h-[60px]" />
                <div className="profile-name-id space-y-2">
                    <div className="h-5 shimmer-premium rounded-md w-3/4" />
                    <div className="flex items-center gap-2">
                        <div className="h-4 shimmer-premium rounded-md w-12" />
                        <div className="h-4 shimmer-premium rounded-md w-24" />
                    </div>
                </div>
            </div>

            <div className="org-info-box-skeleton p-4 bg-slate-50/50 rounded-xl mt-4 space-y-2">
                <div className="h-4 shimmer-premium rounded-md w-1/2" />
                <div className="h-3 shimmer-premium rounded-md w-full" />
            </div>

            <div className="card-details-list space-y-3 mt-4">
                <div className="h-4 shimmer-premium rounded-md w-full" />
                <div className="h-4 shimmer-premium rounded-md v w-5/6" />
                <div className="h-4 shimmer-premium rounded-md w-4/6" />
            </div>

            <div className="card-contact-footer pt-4 border-t border-slate-100 mt-4 space-y-2">
                <div className="h-4 shimmer-premium rounded-md w-3/4" />
                <div className="h-4 shimmer-premium rounded-md w-1/2" />
            </div>
        </div>
    )
}
