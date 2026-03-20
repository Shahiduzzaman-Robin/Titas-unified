import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomBytes } from 'crypto'

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    },
})

export async function uploadToCloudflare(file: File): Promise<string> {
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = randomBytes(4).toString('hex')
        const ext = file.name.split('.').pop()
        const filename = `${timestamp}-${randomString}.${ext}`

        const key = `assets/uploads/${filename}`

        const command = new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        })

        await s3Client.send(command)

        // Return relative path for database storage (consistent with local path)
        return `/${key}`
    } catch (error) {
        console.error('Cloudflare R2 upload error:', error)
        throw new Error('Failed to upload image to Cloudflare R2')
    }
}

export async function deleteFromCloudflare(path: string): Promise<void> {
    try {
        // Remove leading slash if present to get the key
        const key = path.startsWith('/') ? path.slice(1) : path

        const command = new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
            Key: key,
        })

        await s3Client.send(command)
        console.log(`Deleted from Cloudflare: ${key}`)
    } catch (error) {
        console.error('Cloudflare R2 delete error:', error)
    }
}
