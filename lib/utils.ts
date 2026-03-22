import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export function formatMobile(mobile: string): string {
    // Format mobile number with Bengali digits
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return mobile.split('').map(char => {
        const digit = parseInt(char)
        return isNaN(digit) ? char : bengaliDigits[digit]
    }).join('')
}

export function toEnglishDigits(str: string): string {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return str.replace(/[০-৯]/g, d => bengaliDigits.indexOf(d).toString())
}

export function toBengaliNumber(num: number | string): string {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return num.toString().split('').map(char => {
        const digit = parseInt(char)
        return isNaN(digit) ? char : bengaliDigits[digit]
    }).join('')
}

export function getStudentImageUrl(path: string | null | undefined): string {
    if (!path) return "/assets/avatar-placeholder.png"

    // If it's a full URL, return as is
    if (path.startsWith("http")) return path

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'
    const cfUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL

    // Paths with leading slash (/assets/uploads/...)
    // These are stored in current storage provider (Cloudflare R2 or Local)
    if (path.startsWith("/assets/uploads/")) {
        if (provider === 'cloudflare' && cfUrl) {
            // Remove double slashes if any
            const baseUrl = cfUrl.endsWith('/') ? cfUrl.slice(0, -1) : cfUrl
            return `${baseUrl}${path}`
        }
        // Local provider: return relative path
        return path
    }

    // Default fallback: ensure leading slash
    return path.startsWith("/") ? path : `/${path}`
}

export function optimizeImage(url: string | null | undefined, width: number = 1200): string {
    if (!url) return "/assets/placeholder.jpg"
    
    // Only optimize Cloudinary URLs
    if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
        // If it already has transformations, don't double up
        if (url.includes('f_auto') || url.includes('w_')) return url;
        
        // Return a basic optimized URL for non-Next.js components
        return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
    
    return url
}
