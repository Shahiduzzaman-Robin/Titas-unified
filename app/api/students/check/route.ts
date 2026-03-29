import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toEnglishDigits } from '@/lib/utils'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const session = searchParams.get('session')
        const mobile = searchParams.get('mobile') ? toEnglishDigits(searchParams.get('mobile')!) : null
        const du_reg_number = searchParams.get('du_reg_number') ? toEnglishDigits(searchParams.get('du_reg_number')!) : null
        const email = searchParams.get('email')

        // Case 1: Validate DU Registration Number
        if (du_reg_number) {
            const existingStudent = await prisma.students.findFirst({
                where: {
                    du_reg_number: du_reg_number,
                    approval: { not: 2 } // Ignore rejected users
                },
                select: {
                    id: true,
                    prefix: true,
                    name_en: true,
                    name_bn: true,
                    approval: true
                }
            })

            if (existingStudent) {
                return NextResponse.json({
                    exists: true,
                    field: 'du_reg_number',
                    student: {
                        id: existingStudent.id,
                        prefix: existingStudent.prefix,
                        studentId: `${existingStudent.prefix}-${existingStudent.id}`,
                        name_en: existingStudent.name_en,
                        name_bn: existingStudent.name_bn,
                        approval: existingStudent.approval
                    }
                })
            }
        }

        // Case 2: Validate Mobile Number
        if (mobile) {
            const existingStudent = await prisma.students.findFirst({
                where: {
                    mobile: mobile,
                    approval: { not: 2 } // Ignore rejected users
                },
                select: {
                    id: true,
                    prefix: true,
                    name_en: true,
                    name_bn: true,
                    approval: true
                }
            })

            if (existingStudent) {
                return NextResponse.json({
                    exists: true,
                    field: 'mobile',
                    student: {
                        id: existingStudent.id,
                        prefix: existingStudent.prefix,
                        studentId: `${existingStudent.prefix}-${existingStudent.id}`,
                        name_en: existingStudent.name_en,
                        name_bn: existingStudent.name_bn,
                        approval: existingStudent.approval
                    }
                })
            }
        }

        // Case 3: Validate Email
        if (email) {
            const existingStudent = await prisma.students.findFirst({
                where: {
                    email: email,
                    approval: { not: 2 } // Ignore rejected users
                },
                select: {
                    id: true,
                    prefix: true,
                    name_en: true,
                    name_bn: true,
                    approval: true
                }
            })

            if (existingStudent) {
                return NextResponse.json({
                    exists: true,
                    field: 'email',
                    student: {
                        id: existingStudent.id,
                        prefix: existingStudent.prefix,
                        studentId: `${existingStudent.prefix}-${existingStudent.id}`,
                        name_en: existingStudent.name_en,
                        name_bn: existingStudent.name_bn,
                        approval: existingStudent.approval
                    }
                })
            }
        }

        return NextResponse.json({ exists: false })

    } catch (error) {
        console.error('Error checking student:', error)
        return NextResponse.json(
            { error: 'Failed to check student' },
            { status: 500 }
        )
    }
}
