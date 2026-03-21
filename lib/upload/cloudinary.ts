import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File): Promise<string> {
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'titas_blog',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        reject(new Error('Failed to upload image to Cloudinary'))
                    } else if (result) {
                        // Return the secure URL
                        resolve(result.secure_url)
                    }
                }
            )
            uploadStream.end(buffer)
        })
    } catch (error) {
        console.error('Cloudinary upload error:', error)
        throw new Error('Failed to upload image to Cloudinary')
    }
}

export async function deleteFromCloudinary(url: string): Promise<void> {
    try {
        // Extract public ID from URL
        // Example URL: https://res.cloudinary.com/cloudname/image/upload/v12345/folder/public_id.jpg
        const parts = url.split('/')
        const filename = parts[parts.length - 1]
        const folder = parts[parts.length - 2]
        const public_id = `${folder}/${filename.split('.')[0]}`

        await cloudinary.uploader.destroy(public_id)
        console.log(`Deleted from Cloudinary: ${public_id}`)
    } catch (error) {
        console.error('Cloudinary delete error:', error)
    }
}
