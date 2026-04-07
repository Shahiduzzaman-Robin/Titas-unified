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

export function resolveStorageUrl(path: string | null | undefined, fallback = "/assets/placeholder.jpg"): string {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local';
    const cfUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL;

    if (path.startsWith("/assets/")) {
        if (provider === 'cloudflare' && cfUrl) {
            const baseUrl = cfUrl.endsWith('/') ? cfUrl.slice(0, -1) : cfUrl;
            return `${baseUrl}${path}`;
        }
        return path;
    }
    
    return path.startsWith("/") ? path : `/${path}`;
}

export function getStudentImageUrl(path: string | null | undefined): string {
    return resolveStorageUrl(path, "/assets/avatar-placeholder.png");
}

export function optimizeImage(url: string | null | undefined, width: number = 1200): string {
    return resolveStorageUrl(url);
}
