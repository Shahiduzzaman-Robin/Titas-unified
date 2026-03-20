"use client"

import Image from 'next/image'
import { useLocale } from 'next-intl'
import { FALLBACK_DICTIONARY } from '@/lib/dictionary'
import { getStudentImageUrl } from '@/lib/utils'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Phone, Building2, BookOpen, Droplets, Mail, Briefcase, GraduationCap } from 'lucide-react'

interface StudentCardProps {
    student: {
        id: number
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
    sessionMap?: Record<string, string>
    departmentMap?: Record<string, string>
    hallMap?: Record<string, string>
    upazilaMap?: Record<string, string>
}

export function StudentCard({
    student,
    sessionMap,
    departmentMap,
    hallMap,
    upazilaMap
}: StudentCardProps) {
    const locale = useLocale()
    const isBengali = locale === 'bn'

    const name = isBengali ? (student.name_bn || student.name_en) : (student.name_en || student.name_bn)
    const address = isBengali ? (student.address_bn || student.address_en) : (student.address_en || student.address_bn)

    // Get localized names if available
    const sessionVal = student.student_session
    let sessionName = (sessionVal && sessionMap?.[sessionVal]) ? sessionMap[sessionVal] : sessionVal
    
    const deptVal = student.department
    let deptName = (deptVal && departmentMap?.[deptVal]) ? departmentMap[deptVal] : deptVal
    
    const hallVal = student.hall
    let hallName = (hallVal && hallMap?.[hallVal]) ? hallMap[hallVal] : hallVal
    
    const upazilaVal = student.upazila
    let upazilaName = (upazilaVal && upazilaMap?.[upazilaVal]) ? upazilaMap[upazilaVal] : upazilaVal

    // If still not translated and in English mode, check our fallback dictionary
    if (!isBengali) {
        if (sessionVal && FALLBACK_DICTIONARY[sessionVal]) sessionName = FALLBACK_DICTIONARY[sessionVal]
        if (deptVal && FALLBACK_DICTIONARY[deptVal]) deptName = FALLBACK_DICTIONARY[deptVal]
        if (hallVal && FALLBACK_DICTIONARY[hallVal]) hallName = FALLBACK_DICTIONARY[hallVal]
        if (upazilaVal && FALLBACK_DICTIONARY[upazilaVal]) upazilaName = FALLBACK_DICTIONARY[upazilaVal]
    }

    // Localize job info as well
    const jobDesignation = student.job_designation
    const jobPosition = student.job_position
    
    const displayDesignation = (!isBengali && jobDesignation && FALLBACK_DICTIONARY[jobDesignation]) 
        ? FALLBACK_DICTIONARY[jobDesignation] 
        : jobDesignation
        
    const displayPosition = (!isBengali && jobPosition && FALLBACK_DICTIONARY[jobPosition])
        ? FALLBACK_DICTIONARY[jobPosition]
        : jobPosition

    // Mask mobile numbers for female students (already done in server-side but let's be safe if needed)
    const mobile = student.mobile

    return (
        <div className="student-card-modern group">
            {/* Blood Group Tag - Top Right */}
            {student.blood_group && (
                <div className="blood-group-badge">
                    <Droplets size={12} strokeWidth={3} fill="currentColor" />
                    {student.blood_group}
                </div>
            )}
            
            {/* Profile Header */}
            <div className="card-header-profile">
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="avatar-container cursor-zoom-in">
                            <Image
                                src={getStudentImageUrl(student.image_path)}
                                alt={name || 'Student'}
                                fill
                                className="avatar-image group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/20 [&>button]:hover:bg-black/40">
                        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl">
                            <Image
                                src={getStudentImageUrl(student.image_path)}
                                alt={name || 'Student'}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
                
                <div className="profile-name-id">
                    <h3 className="bn-text" title={name || ''}>
                        {name}
                    </h3>
                    <div className="id-session">
                        <span className="id-badge">ID: {student.id}</span>
                        {sessionName && (
                            <>
                                <span className="text-slate-300">|</span>
                                <span className="bn-text">{sessionName}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Organization Info Box (Blue Section) */}
            <div className="org-info-box">
                <div className="org-icon-wrapper">
                    <Briefcase size={16} />
                </div>
                <div className="org-text-content">
                    {displayDesignation && (
                        <span className="org-designation bn-text">{displayDesignation}</span>
                    )}
                    <span className="org-name-bn">{displayPosition || (isBengali ? 'তিতাস-ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলা ছাত্রকল্যাণ পরিষদ' : 'Dhaka University Students\' Welfare Association of Brahmanbaria (TITAS)')}</span>
                </div>
            </div>

            {/* Details List */}
            <div className="card-details-list">
                {/* Department */}
                <div className="detail-row">
                    <BookOpen size={14} className="detail-icon" />
                    <span className="bn-text truncate">{deptName}</span>
                </div>

                {/* Hall */}
                {hallName && (
                    <div className="detail-row">
                        <Building2 size={14} className="detail-icon" />
                        <span className="bn-text truncate">{hallName}</span>
                    </div>
                )}

                {/* Address/Upazila */}
                {/* Address & Upazila */}
                {(address || upazilaName) && (
                    <div className="detail-row">
                        <MapPin size={14} className="detail-icon" />
                        <span className="bn-text truncate">
                            {[
                                address?.replace(/[,\s]*(Brahmanbaria|ব্রাহ্মণবাড়িয়া)/gi, '').trim(),
                                upazilaName?.trim()
                            ].filter(Boolean).filter((val, i, array) => array.findIndex(v => v === val) === i).join(', ')}
                        </span>
                    </div>
                )}
            </div>

            {/* Contact Footer */}
            <div className="card-contact-footer">
                {mobile && (
                    <div className="contact-row">
                        <Phone size={14} className="contact-icon" />
                        <span className="font-medium tracking-tight">{mobile}</span>
                    </div>
                )}
                {student.email && (
                    <div className="contact-row">
                        <Mail size={14} className="contact-icon" />
                        <span className="font-medium truncate" title={student.email}>{student.email}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
