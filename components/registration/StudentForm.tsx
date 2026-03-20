"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/registration/ImageUpload"
import { bloodGroups } from "@/lib/form-data"
import { Combobox } from "@/components/ui/combobox"
import { Search, User, Mail, Phone, MapPin, GraduationCap, Building2, Droplets, Briefcase, Camera, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, toEnglishDigits } from "@/lib/utils"
import { useLocale } from 'next-intl'
import { getStudentImageUrl } from "@/lib/utils"

interface StudentFormProps {
    initialData?: any
    mode?: 'create' | 'edit'
    onSubmit: (data: any, imageFile: File | null) => Promise<void>
    isSubmitting: boolean
}

export function StudentForm({ initialData, mode = 'create', onSubmit, isSubmitting }: StudentFormProps) {
    const t = useTranslations('public.register')
    const tCommon = useTranslations('common')
    const locale = useLocale()

    const [resetKey, setResetKey] = useState(0)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [existingStudent, setExistingStudent] = useState<{
        studentId: string
        name_en: string | null
        name_bn: string | null
        approval: number
    } | null>(null)
    const [checkingDuplicate, setCheckingDuplicate] = useState(false)
    const [isJobHolder, setIsJobHolder] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        student_session: "",
        du_reg_number: "",
        name: "",
        name_bn: "",
        address: "",
        address_bn: "",
        upazila: "",
        department: "",
        mobile: "",
        email: "",
        blood_group: "",
        hall: "",
        gender: "",
        job_position: "",
        job_designation: "",
        image_path: "",
        password: ""
    })

    // Load initial data
    useEffect(() => {
        if (initialData) {
            setFormData({
                student_session: initialData.student_session || "",
                du_reg_number: initialData.du_reg_number || "",
                name: initialData.name_en || initialData.name || "",
                name_bn: initialData.name_bn || "",
                address: initialData.address_en || initialData.address || "",
                address_bn: initialData.address_bn || "",
                upazila: initialData.upazila || "",
                department: initialData.department || "",
                mobile: initialData.mobile || "",
                email: initialData.email || "",
                blood_group: initialData.blood_group || "",
                hall: initialData.hall || "",
                gender: initialData.gender || "",
                job_position: initialData.job_position || "",
                job_designation: initialData.job_designation || "",
                image_path: initialData.image_path || "",
                password: "" // Don't load password
            })
            setIsJobHolder(!!(initialData.job_position || initialData.job_designation))
        }
    }, [initialData])

    // Options Data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [options, setOptions] = useState<{
        sessions: any[],
        departments: any[],
        halls: any[],
        upazilas: any[]
    }>({
        sessions: [],
        departments: [],
        halls: [],
        upazilas: []
    })

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [sessionsRes, departmentsRes, hallsRes, upazilasRes] = await Promise.all([
                    fetch('/api/options/sessions'),
                    fetch('/api/options/departments'),
                    fetch('/api/options/halls'),
                    fetch('/api/options/upazilas')
                ])

                if (sessionsRes.ok && departmentsRes.ok && hallsRes.ok && upazilasRes.ok) {
                    setOptions({
                        sessions: await sessionsRes.json(),
                        departments: await departmentsRes.json(),
                        halls: await hallsRes.json(),
                        upazilas: await upazilasRes.json()
                    })
                }
            } catch (error) {
                toast.error(t('loadError'))
            }
        }
        fetchOptions()
    }, [t])

    // Check for existing student with DU Registration Number
    useEffect(() => {
        if (mode === 'edit') return

        const checkDuRegNumber = async () => {
            if (formData.du_reg_number) {
                setCheckingDuplicate(true)
                try {
                    const normalizedReg = toEnglishDigits(formData.du_reg_number)
                    const res = await fetch(`/api/students/check?du_reg_number=${encodeURIComponent(normalizedReg)}`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.exists && data.field === 'du_reg_number') {
                            setExistingStudent(data.student)
                        } else if (!data.exists && existingStudent?.studentId) {
                            setExistingStudent(null)
                        }
                    }
                } catch (error) {
                    console.error('Error checking student:', error)
                } finally {
                    setCheckingDuplicate(false)
                }
            }
        }

        const timer = setTimeout(checkDuRegNumber, 500)
        return () => clearTimeout(timer)
    }, [formData.du_reg_number, t, mode, existingStudent?.studentId])

    // Check for existing student with Mobile Number
    useEffect(() => {
        if (mode === 'edit') return

        const checkMobile = async () => {
            if (formData.mobile && formData.mobile.length >= 11) {
                setCheckingDuplicate(true)
                try {
                    const normalizedMobile = toEnglishDigits(formData.mobile)
                    const res = await fetch(`/api/students/check?mobile=${encodeURIComponent(normalizedMobile)}`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.exists && data.field === 'mobile') {
                            setExistingStudent(data.student)
                        } else if (!data.exists && existingStudent?.studentId) {
                            setExistingStudent(null)
                        }
                    }
                } catch (error) {
                    console.error('Error checking student:', error)
                } finally {
                    setCheckingDuplicate(false)
                }
            }
        }

        const timer = setTimeout(checkMobile, 500)
        return () => clearTimeout(timer)
    }, [formData.mobile, t, mode, existingStudent?.studentId])

    // Check for existing student with Email
    useEffect(() => {
        if (mode === 'edit') return

        const checkEmail = async () => {
            if (formData.email && formData.email.includes('@')) {
                setCheckingDuplicate(true)
                try {
                    const res = await fetch(`/api/students/check?email=${encodeURIComponent(formData.email)}`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.exists && data.field === 'email') {
                            setExistingStudent(data.student)
                        } else if (!data.exists && existingStudent?.studentId) {
                            setExistingStudent(null)
                        }
                    }
                } catch (error) {
                    console.error('Error checking student:', error)
                } finally {
                    setCheckingDuplicate(false)
                }
            }
        }

        const timer = setTimeout(checkEmail, 500)
        return () => clearTimeout(timer)
    }, [formData.email, t, mode, existingStudent?.studentId])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }

            // Auto-select gender based on hall
            if (field === 'hall') {
                const femaleHalls = [
                    "Rokeya Hall",
                    "Shamsun Nahar Hall",
                    "Bangladesh–Kuwait Maitree Hall",
                    "Bangamata Sheikh Fazilatunnesa Mujib Hall",
                    "Kavi Sufia Kamal Hall",
                    "Nawab Faizunnesa চৌধুরানী ছাত্রী নিবাস",
                    "Shaheed Athlete সুলতানা কামাল হোস্টেল"
                ]

                if (femaleHalls.includes(value)) {
                    newData.gender = 'female'
                } else if (value) {
                    newData.gender = 'male'
                }
            }

            return newData
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (mode === 'create' && existingStudent) {
            toast.error(t('alreadyRegisteredToast'))
            return
        }

        if (mode === 'create' && !imageFile) {
            toast.error(t('uploadError'))
            return
        }

        // Basic validation
        if (!formData.student_session || !formData.du_reg_number || !formData.name || !formData.name_bn || !formData.mobile || !formData.email || !formData.address || !formData.address_bn || !formData.upazila || !formData.department || !formData.blood_group || !formData.hall || !formData.gender || (mode === 'create' && !formData.password)) {
            toast.error(tCommon('fillAllFields'))
            return
        }

        // Mobile number length verification (must be exactly 11 digits and start with 01)
        const normalizedMobile = toEnglishDigits(formData.mobile)
        if (normalizedMobile.length !== 11 || !normalizedMobile.startsWith('01')) {
            toast.error(t('mobileLengthError'))
            return
        }

        await onSubmit(formData, imageFile)
    }

    // Helper to get localized name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getOptionName = (item: any) => {
        if (locale === 'bn' && item.name_bn) {
            return item.name_bn
        }
        return item.name
    }

    return (
        <Card className="border border-slate-200 shadow-sm bg-white bn-text rounded-2xl overflow-hidden max-w-6xl mx-auto my-12">
            <CardHeader className="p-10 pb-4 text-center">
                <CardTitle className="text-3xl font-extrabold text-slate-900 mb-2 mt-4 text-center">
                    {mode === 'edit' ? tCommon('edit_profile') : t('formTitle')}
                </CardTitle>
                <CardDescription className="text-base text-slate-500">
                    {t('formDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 pb-20">
                <style jsx global>{`
                    .duplicate-record-card {
                        border: 2px solid #fce8a3;
                        border-radius: 12px;
                        background: #fffbef;
                        color: #92400e;
                        padding: 1.5rem;
                        margin-bottom: 2.5rem;
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        animation: slideDown 0.3s ease-out;
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .duplicate-record-icon {
                        width: 48px;
                        height: 48px;
                        min-width: 48px;
                        border-radius: 999px;
                        background: #fef3c7;
                        color: #92400e;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .duplicate-record-content h3 {
                        margin: 0 0 0.5rem;
                        font-size: 1.25rem;
                        font-weight: 800;
                        color: #92400e;
                    }
                    .duplicate-record-content p {
                        margin: 0 0 0.4rem;
                        font-size: 1rem;
                        font-weight: 700;
                        color: #92400e;
                    }
                    .duplicate-badge {
                        display: inline-block;
                        background: #fde68a;
                        color: #92400e;
                        border-radius: 6px;
                        padding: 0.15rem 0.5rem;
                        font-weight: 800;
                        font-size: 0.9rem;
                        margin-left: 0.5rem;
                    }
                    .duplicate-record-note {
                        color: #b45309;
                        font-style: italic;
                        font-size: 0.9rem !important;
                        margin-top: 0.75rem !important;
                        font-weight: 600 !important;
                    }
                `}</style>

                <AnimatePresence>
                    {mode === 'create' && existingStudent && (
                        <div className="duplicate-record-card">
                            <div className="duplicate-record-icon">
                                <Search className="w-7 h-7" />
                            </div>
                            <div className="duplicate-record-content">
                                <h3>{t('duplicateWarningTitle')}</h3>
                                <p>{t('duplicateStudentName')}: <span className="text-slate-700 font-bold">{locale === 'bn' ? (existingStudent.name_bn || existingStudent.name_en) : (existingStudent.name_en || existingStudent.name_bn)}</span></p>
                                <p>{t('duplicateStudentId')}: <span className="duplicate-badge">{existingStudent.studentId}</span></p>
                                <p className="duplicate-record-note">{t('duplicateNote')}</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid lg:grid-cols-[2fr,1fr] gap-10 items-start">
                        {/* Left Column: Form Fields */}
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('session')}</Label>
                                    <Combobox
                                        value={formData.student_session}
                                        onChange={(val) => handleChange('student_session', val)}
                                        options={options.sessions.map((item: any) => ({
                                            label: getOptionName(item),
                                            value: item.name
                                        })).sort((a, b) => b.label.localeCompare(a.label, locale === 'bn' ? 'bn' : 'en'))}
                                        placeholder={t('sessionPlaceholder')}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('duRegNumber')}</Label>
                                    <Input
                                        placeholder={t('duRegNumberPlaceholder')}
                                        value={formData.du_reg_number}
                                        onChange={(e) => handleChange('du_reg_number', e.target.value)}
                                        required
                                        className="h-11 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">{t('name')}</Label>
                                <Input
                                    placeholder={t('namePlaceholder')}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">{t('nameBn')}</Label>
                                <Input
                                    placeholder={t('nameBnPlaceholder')}
                                    value={formData.name_bn}
                                    onChange={(e) => handleChange('name_bn', e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('mobile')}</Label>
                                    <Input
                                        placeholder={t('mobilePlaceholder')}
                                        value={formData.mobile}
                                        onChange={(e) => {
                                            let val = toEnglishDigits(e.target.value).replace(/\D/g, '');
                                            if (val.length > 11) val = val.substring(0, 11);
                                            if (val.length >= 1 && val[0] !== '0') val = '';
                                            if (val.length >= 2 && val[1] !== '1') val = '0';
                                            handleChange('mobile', val);
                                        }}
                                        required
                                        type="tel"
                                        className="h-11 rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('email')}</Label>
                                    <Input
                                        placeholder={t('emailPlaceholder')}
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        required
                                        type="email"
                                        className="h-11 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('address')}</Label>
                                    <Input
                                        placeholder={t('addressPlaceholder')}
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        required
                                        className="h-11 rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('addressBn')}</Label>
                                    <Input
                                        placeholder={t('addressBnPlaceholder')}
                                        value={formData.address_bn}
                                        onChange={(e) => handleChange('address_bn', e.target.value)}
                                        required
                                        className="h-11 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('upazila')}</Label>
                                    <Combobox
                                        value={formData.upazila}
                                        onChange={(val) => handleChange('upazila', val)}
                                        options={options.upazilas.map((item: any) => ({
                                            label: getOptionName(item),
                                            value: item.name
                                        })).sort((a, b) => a.label.localeCompare(b.label, locale === 'bn' ? 'bn' : 'en'))}
                                        placeholder={t('upazilaPlaceholder')}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('department')}</Label>
                                    <Combobox
                                        value={formData.department}
                                        onChange={(val) => handleChange('department', val)}
                                        options={options.departments.map((item: any) => ({
                                            label: getOptionName(item),
                                            value: item.name
                                        })).sort((a, b) => a.label.localeCompare(b.label, locale === 'bn' ? 'bn' : 'en'))}
                                        placeholder={t('departmentPlaceholder')}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('bloodGroup')}</Label>
                                    <Combobox
                                        value={formData.blood_group}
                                        onChange={(val) => handleChange('blood_group', val)}
                                        options={bloodGroups.map((bg) => ({
                                            label: bg,
                                            value: bg
                                        }))}
                                        placeholder={t('bloodGroupPlaceholder')}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('hall')}</Label>
                                    <Combobox
                                        value={formData.hall}
                                        onChange={(val) => handleChange('hall', val)}
                                        options={options.halls.map((item: any) => ({
                                            label: getOptionName(item),
                                            value: item.name
                                        })).sort((a, b) => a.label.localeCompare(b.label, locale === 'bn' ? 'bn' : 'en'))}
                                        placeholder={t('hallPlaceholder')}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">{t('gender')}</Label>
                                    <Combobox
                                        value={formData.gender}
                                        onChange={(val) => handleChange('gender', val)}
                                        options={[
                                            { label: "Male", value: "male" },
                                            { label: "Female", value: "female" }
                                        ]}
                                        placeholder="Select Gender"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="pb-2">
                                    <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 w-full">
                                        <input
                                            type="checkbox"
                                            id="isJobHolder"
                                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                            checked={isJobHolder}
                                            onChange={(e) => {
                                                const checked = e.target.checked
                                                setIsJobHolder(checked)
                                                if (!checked) {
                                                    setFormData(prev => ({ ...prev, job_position: "", job_designation: "" }))
                                                }
                                            }}
                                        />
                                        <label htmlFor="isJobHolder" className="text-sm font-bold text-slate-700 cursor-pointer">
                                            {t('isJobHolder')}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">{t('password')} {mode === 'create' && <span className="text-red-500">*</span>}</Label>
                                <Input
                                    type="password"
                                    placeholder={t('passwordPlaceholder')}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    required={mode === 'create'}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">{t('passwordNote')}</p>
                            </div>

                                <AnimatePresence>
                                    {isJobHolder && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid sm:grid-cols-2 gap-4 overflow-hidden pt-1"
                                        >
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">{t('institutionName')}</Label>
                                                <Input
                                                    placeholder={t('institutionPlaceholder')}
                                                    value={formData.job_position}
                                                    onChange={(e) => handleChange('job_position', e.target.value)}
                                                    required={isJobHolder}
                                                    className="h-11 rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">{t('designation')}</Label>
                                                <Input
                                                    placeholder={t('designationPlaceholder')}
                                                    value={formData.job_designation}
                                                    onChange={(e) => handleChange('job_designation', e.target.value)}
                                                    required={isJobHolder}
                                                    className="h-11 rounded-xl border-slate-200"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        {/* Right Column: Image & Action */}
                        <div className="space-y-8 sticky top-32">
                            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <ImageUpload
                                    key={resetKey}
                                    onChange={(file) => setImageFile(file)}
                                    value={initialData?.image_path ? getStudentImageUrl(initialData.image_path) : undefined}
                                    required={mode === 'create'}
                                />
                            </div>

                            <div className="pt-4 space-y-4">
                                <Button 
                                    className="w-full h-14 rounded-lg bg-[#1a1a1a] hover:bg-black text-white font-bold text-xl shadow-none transition-all" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('submitting')}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {mode === 'edit' ? tCommon('save') : t('submit')}
                                        </div>
                                    )}
                                </Button>
                                <p className="text-[11px] text-slate-400 text-center px-4">
                                    নিশ্চিত করার আগে আপনার সকল তথ্য পুনরায় যাচাই করে নিন।
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
