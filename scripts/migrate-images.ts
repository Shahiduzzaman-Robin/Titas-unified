import { PrismaClient } from '@prisma/client'
import { uploadImage } from '../lib/upload/index'
import path from 'path'

const prisma = new PrismaClient()

// Configuration
const CLOUDFLARE_R2_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL?.replace('https://', '') || 'pub-57af7ec93e46465d8ff4fd5cf402bcf9.r2.dev'

async function processImage(url: string, filename: string): Promise<string | null> {
    try {
        const res = await fetch(url)
        if (!res.ok) {
            console.warn(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
            return null
        }

        const blob = await res.blob()
        const mimeType = res.headers.get('content-type') || 'image/jpeg'

        // Create a File object from the blob
        const file = new File([blob], filename, { type: mimeType })

        // Upload using unified upload interface (handles Local/Cloudflare)
        return await uploadImage(file)
    } catch (error) {
        console.error(`Error processing ${url}:`, error)
        return null
    }
}

async function processImageWithRetry(url: string, filename: string, retries = 3): Promise<string | null> {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await processImage(url, filename)
            if (result) return result

            // If result is null but no error was thrown, don't retry
            if (i < retries - 1) {
                console.log(`  > Retry ${i + 1}/${retries - 1}...`)
                await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s
            }
        } catch (error) {
            if (i === retries - 1) {
                console.error(`  > All retries failed for ${filename}`)
                return null
            }
            console.log(`  > Retry ${i + 1}/${retries - 1} after error...`)
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s
        }
    }
    return null
}

async function main() {
    console.log('Starting image migration...')
    console.log(`Storage Provider: ${process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'}`)

    const legacyUrl = process.env.LEGACY_IMAGE_URL
    if (legacyUrl) {
        console.log(`Legacy URL: ${legacyUrl}`)
    }

    let successCount = 0
    let failureCount = 0

    try {
        // Find students with external URLs OR relative paths that need migration
        const students = await prisma.students.findMany({
            where: {
                image_path: {
                    not: null
                },
                OR: [
                    // External URLs (http/https) - migrate to current storage
                    {
                        image_path: {
                            startsWith: 'http'
                        }
                    },
                    // Relative paths without leading slash (only if LEGACY_IMAGE_URL is set)
                    ...(legacyUrl ? [{
                        AND: [
                            { image_path: { not: { startsWith: 'http' } } },
                            { image_path: { not: { startsWith: '/' } } }
                        ]
                    }] : [])
                ]
            }
        })

        console.log(`Found ${students.length} students with images to migrate.`)

        for (const student of students) {
            if (!student.image_path) continue

            let imageUrl = student.image_path

            // If it's a relative path and we have a legacy URL, construct full URL
            if (!imageUrl.startsWith('http') && legacyUrl) {
                imageUrl = `${legacyUrl}/${imageUrl}`
            }

            const filename = path.basename(imageUrl)

            console.log(`Processing ID ${student.id}: ${filename}...`)

            // Process and Upload with retry logic
            const newPath = await processImageWithRetry(imageUrl, filename)

            if (newPath) {
                // Update Database with new path
                await prisma.students.update({
                    where: { id: student.id },
                    data: { image_path: newPath }
                })
                console.log(`  > Success! Updated DB to ${newPath}`)
                successCount++

                // Progress checkpoint every 50 images
                if (successCount % 50 === 0) {
                    console.log(`\n📊 Checkpoint: ${successCount} images migrated successfully so far\n`)
                }
            } else {
                console.log(`  > Failed to process.`)
                failureCount++
            }

            // Rate limiting: 500ms delay between uploads to avoid overwhelming servers
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        console.log('\n✅ Migration completed successfully!')
        console.log(`Success: ${successCount}`)
        console.log(`Failures: ${failureCount}`)
        console.log(`Total Processed: ${successCount + failureCount}`)
    } catch (error) {
        console.error('\n❌ Fatal error during migration:', error)
        console.log(`\n📊 Partial Migration Summary:`)
        console.log(`Success: ${successCount}`)
        console.log(`Failures: ${failureCount}`)
        console.log(`Total Processed: ${successCount + failureCount}`)
        throw error
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
