import { v2 as cloudinary } from 'cloudinary'

function configureCloudinary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

export async function uploadToCloudinary(file: File): Promise<string> {
    configureCloudinary()
    try {
        let buffer: Buffer;
        try {
            const bytes = await file.arrayBuffer()
            buffer = Buffer.from(bytes)
        } catch (bufError: any) {
            const reader = (file as any).stream?.();
            if (reader) {
                const chunks = [];
                for await (const chunk of reader) {
                    chunks.push(chunk);
                }
                buffer = Buffer.concat(chunks);
            } else {
                throw new Error('Failed to extract bits from file object');
            }
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'titas_blog',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        reject(new Error(`Cloudinary error: ${error.message}`))
                    } else if (result) {
                        resolve(result.secure_url)
                    }
                }
            )
            uploadStream.end(buffer)
        })
    } catch (error: any) {
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`)
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
