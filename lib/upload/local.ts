import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

export async function uploadToLocal(file: File): Promise<string> {
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = randomBytes(4).toString('hex')
        const ext = file.name.split('.').pop()
        const filename = `${timestamp}-${randomString}.${ext}`

        // Save to public/assets/uploads
        const uploadDir = join(process.cwd(), 'public', 'assets', 'uploads')
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Return absolute path for database storage (to distinguish from legacy paths)
        return `/assets/uploads/${filename}`
    } catch (error) {
        console.error('Local upload error:', error)
        throw new Error('Failed to upload image locally')
    }
}

export async function deleteFromLocal(path: string): Promise<void> {
    try {
        // Construct absolute path
        // stored path starts with /, e.g. /assets/uploads/file.jpg
        const relativePath = path.startsWith('/') ? path.slice(1) : path
        const filepath = join(process.cwd(), 'public', relativePath)

        await unlink(filepath)
        console.log(`Deleted local file: ${filepath}`)
    } catch (error) {
        console.error('Local delete error:', error)
    }
}
