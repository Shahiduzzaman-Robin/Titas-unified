import { uploadToLocal, deleteFromLocal } from './local'
import { uploadToCloudflare, deleteFromCloudflare } from './cloudflare'

export async function uploadImage(file: File): Promise<string> {
    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || process.env.STORAGE_PROVIDER || 'local';

    if (provider === 'cloudflare') {
        return uploadToCloudflare(file)
    }
    
    return uploadToLocal(file)
}

export async function deleteImage(path: string): Promise<void> {
    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'

    if (provider === 'cloudflare') {
        return deleteFromCloudflare(path)
    }

    return deleteFromLocal(path)
}

export { uploadToLocal, uploadToCloudflare, deleteFromLocal, deleteFromCloudflare }
