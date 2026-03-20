"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Image from "next/image"
import QRCode from "react-qr-code"
import { getStudentImageUrl } from "@/lib/utils"

interface StudentIDCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any
    locale: string
}

export default function StudentIDCard({ student, locale }: StudentIDCardProps) {
    const t = useTranslations('common.idCard')
    const [side, setSide] = useState<'front' | 'back'>('front')
    const qrRef = useRef<HTMLDivElement>(null)

    const toggleSide = () => setSide(side === 'front' ? 'back' : 'front')

    // Data prepared for QR code (Keep minimalistic)
    const qrData = JSON.stringify({
        id: student.id,
        reg: student.du_reg_number,
        name: student.name_en,
        sess: student.student_session,
        bg: student.blood_group
    })



    return (
        <div className="flex flex-col items-center gap-6 p-6">
            <div className="flex gap-4">
                <Button variant="outline" onClick={toggleSide}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {side === 'front' ? t('back') : t('front')}
                </Button>
            </div>

            {/* Display Card (Interactive View) */}
            <div className="relative perspective-1000">
                <div className={`transition-all duration-500 transform ${side === 'back' ? 'hidden' : 'block'}`}>
                    <FrontCard student={student} qrData={qrData} qrRef={qrRef} className="id-card-front" />
                </div>
                <div className={`transition-all duration-500 transform ${side === 'front' ? 'hidden' : 'block'}`}>
                    <BackCard className="id-card-back" />
                </div>
            </div>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FrontCard({ student, qrData, qrRef, className = "" }: {
    student: any,
    qrData: string,
    qrRef?: React.RefObject<HTMLDivElement>,
    className?: string
}) {
    const t = useTranslations('common.idCard')
    const imageUrl = getStudentImageUrl(student.image_path)

    return (
        <div className={`w-[500px] h-[315px] bg-white rounded-xl shadow-xl overflow-hidden relative border border-gray-200 ${className}`}>
            {/* Header Background */}
            <div className="absolute top-0 w-full h-[85px] overflow-hidden">
                <Image
                    src="/assets/idcardbg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 pt-5 h-full flex flex-col">
                {/* Org Title */}
                <div className="text-center mb-4">
                    <h1 className="text-white font-bold text-lg leading-tight tracking-wide drop-shadow-md">
                        {t('orgTitle')}
                    </h1>
                </div>

                <div className="flex gap-4 mt-1 flex-1">
                    {/* Left: Photo & Signature */}
                    <div className="flex flex-col items-center gap-2 w-1/3">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                            <Image
                                src={imageUrl}
                                alt="Student"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover student-photo-for-pdf"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t('id')}</div>
                            <div className="text-sm font-bold text-[#1a4d2e]">TITAS-{student.id}</div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 space-y-1.5 pt-2">
                        <div>
                            <h2 className="font-bold text-[#1a4d2e] text-lg">
                                {student.name_en}
                            </h2>
                            <p className="text-xs text-gray-600 font-medium">{student.department}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                            <div>
                                <span className="text-gray-500 block text-[9px] uppercase">{t('session')}</span>
                                <span className="font-semibold text-gray-800">{student.student_session}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[9px] uppercase">{t('hall')}</span>
                                <span className="font-semibold text-gray-800 truncate block max-w-[120px]" title={student.hall}>{student.hall.split('Hall')[0]}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[9px] uppercase">{t('blood')}</span>
                                <span className="font-bold text-[#e11d48] px-1.5 py-0.5 bg-red-50 rounded inline-block">
                                    {student.blood_group}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[9px] uppercase">{t('mobile')}</span>
                                <span className="font-semibold text-gray-800">{student.mobile}</span>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="mt-1">
                            <span className="text-gray-500 block text-[9px] uppercase">{t('address')}</span>
                            <p className="text-[10px] leading-tight text-gray-800 line-clamp-2">
                                {student.address_en}, {student.upazila}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Bar with QR Code */}
                <div className="absolute bottom-2 right-4" ref={qrRef}>
                    <div className="bg-white p-1 rounded shadow-sm border border-gray-100">
                        <QRCode value={qrData} size={48} level="M" />
                    </div>
                </div>

                {/* Bottom Red Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#e11d48]"></div>
            </div>
        </div>
    )
}

// Back Card Component
function BackCard({ className = "" }: { className?: string }) {
    const t = useTranslations('common.idCard')

    return (
        <div className={`w-[500px] h-[315px] bg-white rounded-xl shadow-xl overflow-hidden relative border border-gray-200 flex flex-col ${className}`}>
            {/* Header */}
            <div className="h-10 bg-[#1a4d2e] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <h3 className="text-white font-bold tracking-widest text-lg z-10">{t('backTitle')}</h3>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <span className="text-8xl font-black">TITAS</span>
                </div>

                <div className="max-w-[80%] space-y-4 z-10">
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                        &quot;{t('backDesc')}&quot;
                    </p>

                    <div className="w-16 h-0.5 bg-gray-200 mx-auto"></div>

                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{t('issuingAuthority')}</p>
                        <p className="text-xs font-bold text-[#1a4d2e]">{t('issuingOrg')}</p>
                    </div>

                    <div className="pt-2">
                        <p className="text-[9px] text-[#e11d48] font-bold border border-[#e11d48] px-2 py-1 rounded inline-block">
                            {t('validity')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-3 border-t border-gray-100 text-center">
                <p className="text-[9px] text-gray-500 mb-1">{t('disclaimer')}</p>
                <div className="flex justify-center gap-4 text-[9px] font-semibold text-[#1a4d2e]">
                    <span>{t('website')}</span>
                    <span>•</span>
                    <span>{t('email')}</span>
                </div>
            </div>
        </div>
    )
}
