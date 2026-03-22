import { prisma } from './prisma'

/**
 * Convert a string into a URL-friendly slug
 */
export const slugify = (value: string = ''): string => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '') // Keep Letter, Mark, Number
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Strip HTML tags from a string
 */
export const stripHtml = (html: string = ''): string => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Calculate reading time in minutes
 */
export const calculateReadingTime = (content: string = ''): number => {
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
}

/**
 * Build a short excerpt from content
 */
export const buildExcerpt = (content: string = '', maxLength: number = 180): string => {
    const plain = stripHtml(content);
    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trim()}...`;
}

/**
 * Generate a unique slug for a model
 */
export const generateUniqueSlug = async (
    modelName: 'blog_posts' | 'blog_categories' | 'blog_tags',
    title: string,
    existingId?: number
): Promise<string> => {
    const base = slugify(title) || 'untitled';
    let slug = base;
    let counter = 1;

    while (true) {
        // @ts-ignore - dynamic model access
        const existing = await (prisma as any)[modelName].findUnique({
            where: { slug }
        });

        if (!existing || (existingId && existing.id === existingId)) {
            return slug;
        }

        counter += 1;
        slug = `${base}-${counter}`;
    }
}
