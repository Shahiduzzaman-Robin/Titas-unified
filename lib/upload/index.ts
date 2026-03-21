import { uploadToLocal, deleteFromLocal } from './local'
import { uploadToCloudflare, deleteFromCloudflare } from './cloudflare'
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary'

export async function uploadImage(file: File): Promise<string> {
    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'

    if (provider === 'cloudinary') {
        return uploadToCloudinary(file)
    }

    if (provider === 'cloudflare') {
        return uploadToCloudflare(file)
    }

    return uploadToLocal(file)
}

export async function deleteImage(path: string): Promise<void> {
    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'

    if (provider === 'cloudinary') {
        return deleteFromCloudinary(path)
    }

    if (provider === 'cloudflare') {
        return deleteFromCloudflare(path)
    }

    return deleteFromLocal(path)
}

export { uploadToLocal, uploadToCloudflare, uploadToCloudinary, deleteFromLocal, deleteFromCloudflare, deleteFromCloudinary }

