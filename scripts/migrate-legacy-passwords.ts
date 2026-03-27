import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting legacy password migration...')
    
    const sqlPath = path.join(process.cwd(), 'public/assets/s1_titasv2.sql')
    if (!fs.existsSync(sqlPath)) {
        console.error('❌ SQL file not found at:', sqlPath)
        return
    }

    const content = fs.readFileSync(sqlPath, 'utf-8')
    const lines = content.split('\n')
    
    let updatedCount = 0
    let skippedCount = 0
    let totalFound = 0

    console.log('📊 Analyzing SQL dump...')

    // Find the INSERT INTO `students` section
    const studentsInsertRegex = /INSERT INTO `students` \(`id`, `du_reg_number`, `student_session`, `name_bn`, `name_en`, `address_bn`, `address_en`, `upazila`, `department`, `mobile`, `email`, `blood_group`, `hall`, `gender`, `image_path`, `image_show`, `approval`, `deny_reason`, `job_position`, `job_designation`, `show_job_position`, `prefix`, `password`, `district`, `createdAt`, `updatedAt`, `approvedBy`\) VALUES/
    
    let isStudentSection = false
    
    for (const line of lines) {
        if (studentsInsertRegex.test(line)) {
            isStudentSection = true
            continue
        }
        
        if (isStudentSection && (line.startsWith('(') || (line.startsWith(',') && line.includes('(')))) {
            // Extract values from (id, du_reg, ..., password, ...)
            // Caution: SQL values are comma separated but strings can contain commas. 
            // Better to split by '),(' or handle carefully.
            
            // Simplified parsing for students specifically
            // We need mobile (index 9) and password (index 22)
            
            const matches = line.match(/\((.*?)\)[,;]/g)
            if (matches) {
                for (const match of matches) {
                    const values = parseSqlValues(match)
                    if (values.length >= 23) {
                        const mobile = values[9] === 'NULL' ? null : values[9]?.replace(/'/g, '')
                        const email = values[10] === 'NULL' ? null : values[10]?.replace(/'/g, '')
                        const password = values[22] === 'NULL' ? null : values[22]?.replace(/'/g, '')

                        if (password && (mobile || email)) {
                            totalFound++
                            
                            // Try to find the student in the new DB
                            const student = await prisma.students.findFirst({
                                where: {
                                    OR: [
                                        mobile ? { mobile } : {},
                                        email ? { email } : {}
                                    ].filter(cond => Object.keys(cond).length > 0) as any
                                }
                            })

                            if (student) {
                                await prisma.students.update({
                                    where: { id: student.id },
                                    data: { legacy_password: password }
                                })
                                updatedCount++
                            } else {
                                skippedCount++
                            }
                        }
                    }
                }
            }
        } else if (line.startsWith('--') || line.trim() === '') {
            // Skip comments and empty lines
        } else if (isStudentSection && line.includes(';')) {
            // End of student inserts
            // Optimization: Keep going if there are multiple INSERT statements
        }
    }

    console.log(`✅ Migration complete!`)
    console.log(`📈 Total student passwords found in SQL: ${totalFound}`)
    console.log(`✨ Successfully updated in new DB: ${updatedCount}`)
    console.log(`⏭️ Ignored (no match found in new DB): ${skippedCount}`)
}

/**
 * Simple parser for SQL value strings like "(1, '2019', NULL, 'Password')"
 */
function parseSqlValues(sqlRow: string): string[] {
    const content = sqlRow.trim().replace(/^\(/, '').replace(/\)[,;]?$/, '')
    const results: string[] = []
    let current = ''
    let inQuote = false
    let quoteChar = ''

    for (let i = 0; i < content.length; i++) {
        const char = content[i]
        if ((char === "'" || char === '"') && content[i - 1] !== '\\') {
            if (!inQuote) {
                inQuote = true
                quoteChar = char
            } else if (char === quoteChar) {
                inQuote = false
            }
            current += char
        } else if (char === ',' && !inQuote) {
            results.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    results.push(current.trim())
    return results
}

main()
    .catch(e => {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
