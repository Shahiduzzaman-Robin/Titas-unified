import { prisma } from '@/lib/prisma'
import StudentDirectoryClient from './client'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'Student Directory | Titas Community Hub',
    description: 'Browse all registered students from Brahmanbaria at Dhaka University',
    robots: {
        index: true,
        follow: true,
    }
}

interface StudentsPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        page?: string;
        search?: string;
        session?: string;
        department?: string;
        hall?: string;
        upazila?: string;
        blood_group?: string;
        gender?: string;
    }>;
}

export default async function StudentsPage({ params, searchParams }: StudentsPageProps) {
    const { locale } = await params;
    const searchParamsVal = await searchParams;
    const page = parseInt(searchParamsVal.page || '1', 10);
    const limit = 60;
    const skip = (page - 1) * limit;

    const filters: any = {
        approval: 1
    };

    if (searchParamsVal.search) {
        const idMatch = searchParamsVal.search.match(/^([a-zA-Z]+)-(\d+)$/i);
        
        if (idMatch) {
            filters.AND = [
                { prefix: { equals: idMatch[1], mode: 'insensitive' } },
                { id: parseInt(idMatch[2]) }
            ];
        } else {
            filters.OR = [
                { name_en: { contains: searchParamsVal.search } },
                { name_bn: { contains: searchParamsVal.search } },
                { mobile: { contains: searchParamsVal.search } },
                { email: { contains: searchParamsVal.search } }
            ];
        }
    }

    if (searchParamsVal.session) filters.student_session = searchParamsVal.session;
    if (searchParamsVal.department) filters.department = searchParamsVal.department;
    if (searchParamsVal.hall) filters.hall = searchParamsVal.hall;
    if (searchParamsVal.upazila) filters.upazila = searchParamsVal.upazila;
    if (searchParamsVal.blood_group) filters.blood_group = searchParamsVal.blood_group;
    if (searchParamsVal.gender) filters.gender = searchParamsVal.gender;

    try {
        const [students, total, sessions, departments, halls, upazilas] = await Promise.all([
            prisma.students.findMany({
                where: filters,
                skip,
                take: limit,
                orderBy: { id: 'asc' },
                select: {
                    id: true,
                    prefix: true,
                    name_en: true,
                    name_bn: true,
                    address_en: true,
                    address_bn: true,
                    student_session: true,
                    department: true,
                    hall: true,
                    upazila: true,
                    mobile: true,
                    email: true,
                    blood_group: true,
                    gender: true,
                    image_path: true,
                    job_position: true,
                    job_designation: true
                }
            }),
            prisma.students.count({ where: filters }),
            prisma.sessions.findMany({ where: { isActive: true }, orderBy: { name: 'desc' } }),
            prisma.departments.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
            prisma.halls.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
            prisma.upazilas.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
        ]);

        // Create lookup maps that translate to the CURRENT locale regardless of input (EN or BN)
        const isBn = locale === 'bn';
        const sessionMap = Object.fromEntries(sessions.flatMap(s => [
            [s.name, isBn ? (s.name_bn || s.name) : s.name],
            [s.name_bn || '', isBn ? (s.name_bn || s.name) : s.name]
        ].filter(([k]) => k)));

        const departmentMap = Object.fromEntries(departments.flatMap(d => [
            [d.name, isBn ? (d.name_bn || d.name) : d.name],
            [d.name_bn || '', isBn ? (d.name_bn || d.name) : d.name]
        ].filter(([k]) => k)));

        const hallMap = Object.fromEntries(halls.flatMap(h => [
            [h.name, isBn ? (h.name_bn || h.name) : h.name],
            [h.name_bn || '', isBn ? (h.name_bn || h.name) : h.name]
        ].filter(([k]) => k)));

        const upazilaMap = Object.fromEntries(upazilas.flatMap(u => [
            [u.name, isBn ? (u.name_bn || u.name) : u.name],
            [u.name_bn || '', isBn ? (u.name_bn || u.name) : u.name]
        ].filter(([k]) => k)));

        // Mask mobile numbers for female students
        const maskedStudents = students.map(student => {
            if (student.gender?.toLowerCase() === 'female' && student.mobile?.length === 11) {
                return {
                    ...student,
                    mobile: student.mobile.substring(0, 5) + '****' + student.mobile.substring(9)
                };
            }
            return student;
        });

        return (
            <StudentDirectoryClient
                initialStudents={maskedStudents}
                pagination={{
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }}
                filters={{
                    sessions: sessions.map(s => s.name),
                    departments: departments.map(d => d.name),
                    halls: halls.map(h => h.name),
                    upazilas: upazilas.map(u => u.name),
                    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
                    genders: ['male', 'female']
                }}
                maps={{
                    sessionMap,
                    departmentMap,
                    hallMap,
                    upazilaMap
                }}
                currentFilters={searchParamsVal}
            />
        );
    } catch (error) {
        console.error('Error loading students from DB:', error);
        
        return (
            <div className="pt-32 pb-32 min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h2>
                    <p className="text-gray-600 mb-6">
                        We could not retrieve student data. The live database connection appears to be failing or unreachable from the server.
                    </p>
                    <p className="text-sm text-gray-400">
                        Check your Vercel Environment Variables: Ensure DATABASE_URL is correct and append ?pgbouncer=true or ?connection_limit=1 if using Neon PostgreSQL.
                    </p>
                </div>
            </div>
        );
    }
}
