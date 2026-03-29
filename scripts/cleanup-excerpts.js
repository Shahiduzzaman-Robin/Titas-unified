const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Strip HTML tags and decode common entities
 */
const stripHtml = (html = '') => {
    return html
        .replace(/<[^>]*>/g, ' ')       // Remove HTML tags
        .replace(/&nbsp;/gi, ' ')        // Decode non-breaking spaces
        .replace(/&amp;/gi, '&')         // Decode &
        .replace(/&lt;/gi, '<')          // Decode <
        .replace(/&gt;/gi, '>')          // Decode >
        .replace(/&quot;/gi, '"')        // Decode "
        .replace(/&#39;/gi, "'")         // Decode '
        .replace(/&[a-z]+;/gi, ' ')      // Remove any other HTML entities
        .replace(/\s+/g, ' ')            // Collapse multiple spaces
        .trim();
}

/**
 * Build a short excerpt from content
 */
const buildExcerpt = (content = '', maxLength = 180) => {
    const plain = stripHtml(content);
    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trim()}...`;
}

async function main() {
    console.log('Starting blog excerpt cleanup...');
    
    const posts = await prisma.blog_posts.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            excerpt: true
        }
    });

    console.log(`Found ${posts.length} posts to process.`);

    for (const post of posts) {
        const newExcerpt = buildExcerpt(post.content);
        
        // Only update if it's different or contains entities
        if (post.excerpt !== newExcerpt || post.excerpt.includes('&nbsp;')) {
            await prisma.blog_posts.update({
                where: { id: post.id },
                data: { excerpt: newExcerpt }
            });
            console.log(`Updated excerpt for post: ${post.title}`);
        } else {
            console.log(`Skipped (already clean): ${post.title}`);
        }
    }

    console.log('Cleanup complete!');
}

main()
    .catch(e => {
        console.error('Error during cleanup:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
