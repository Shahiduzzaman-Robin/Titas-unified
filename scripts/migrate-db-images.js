/**
 * Check and migrate remaining Cloudinary URLs in the database
 * Tables to check: blog_posts (featuredImage + content), gallery_images (url)
 */

const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET = process.env.CLOUDFLARE_BUCKET_NAME;
const PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL;

async function downloadAndUpload(url, folder) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        // Generate unique filename
        const ext = url.split('.').pop().split('?')[0] || 'jpg';
        const randomStr = crypto.randomBytes(4).toString('hex');
        const filename = `${Date.now()}-${randomStr}.${ext}`;
        const key = `assets/${folder}/${filename}`;
        
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));
        
        return `/${key}`;
    } catch (error) {
        console.error(`  ❌ Failed to migrate ${url}:`, error.message);
        return null;
    }
}

async function main() {
    const mode = process.argv[2] || 'check'; // 'check' or 'migrate'
    
    console.log(`\n🔍 Mode: ${mode.toUpperCase()}\n`);
    
    // 1. Check blog_posts.featuredImage
    const postsWithCloudinary = await prisma.blog_posts.findMany({
        where: {
            featuredImage: { contains: 'res.cloudinary.com' }
        },
        select: { id: true, title: true, slug: true, featuredImage: true }
    });
    
    console.log(`📝 Blog Posts with Cloudinary featured images: ${postsWithCloudinary.length}`);
    for (const post of postsWithCloudinary) {
        console.log(`   - [${post.id}] "${post.title}" → ${post.featuredImage}`);
        
        if (mode === 'migrate') {
            const newPath = await downloadAndUpload(post.featuredImage, 'blog');
            if (newPath) {
                await prisma.blog_posts.update({
                    where: { id: post.id },
                    data: { featuredImage: newPath }
                });
                console.log(`     ✅ Updated to: ${newPath}`);
            }
        }
    }
    
    // 2. Check blog_posts.content for inline Cloudinary images
    const postsWithInlineCloudinary = await prisma.blog_posts.findMany({
        where: {
            content: { contains: 'res.cloudinary.com' }
        },
        select: { id: true, title: true, slug: true, content: true }
    });
    
    console.log(`\n📝 Blog Posts with Cloudinary images in content: ${postsWithInlineCloudinary.length}`);
    for (const post of postsWithInlineCloudinary) {
        // Extract cloudinary URLs from content
        const matches = post.content.match(/https?:\/\/res\.cloudinary\.com[^\s"')]+/g) || [];
        console.log(`   - [${post.id}] "${post.title}" → ${matches.length} inline image(s)`);
        
        if (mode === 'migrate') {
            let updatedContent = post.content;
            for (const oldUrl of matches) {
                const newPath = await downloadAndUpload(oldUrl, 'blog-content');
                if (newPath) {
                    const newUrl = `${PUBLIC_URL}${newPath}`;
                    updatedContent = updatedContent.replaceAll(oldUrl, newUrl);
                    console.log(`     ✅ Replaced inline image`);
                }
            }
            if (updatedContent !== post.content) {
                await prisma.blog_posts.update({
                    where: { id: post.id },
                    data: { content: updatedContent }
                });
            }
        }
    }
    
    // 3. Check gallery_images.url
    const galleryWithCloudinary = await prisma.gallery_images.findMany({
        where: {
            url: { contains: 'res.cloudinary.com' }
        },
        select: { id: true, title: true, url: true }
    });
    
    console.log(`\n🖼️  Gallery images with Cloudinary URLs: ${galleryWithCloudinary.length}`);
    for (const img of galleryWithCloudinary) {
        console.log(`   - [${img.id}] "${img.title || 'Untitled'}" → ${img.url}`);
        
        if (mode === 'migrate') {
            const newPath = await downloadAndUpload(img.url, 'gallery');
            if (newPath) {
                await prisma.gallery_images.update({
                    where: { id: img.id },
                    data: { url: newPath }
                });
                console.log(`     ✅ Updated to: ${newPath}`);
            }
        }
    }
    
    // 4. Also check students table for any remaining
    const studentsWithCloudinary = await prisma.students.count({
        where: {
            image_path: { contains: 'res.cloudinary.com' }
        }
    });
    console.log(`\n👤 Students still with Cloudinary URLs: ${studentsWithCloudinary}`);
    
    // Summary
    const total = postsWithCloudinary.length + postsWithInlineCloudinary.length + galleryWithCloudinary.length + studentsWithCloudinary;
    console.log(`\n${'='.repeat(50)}`);
    if (total === 0) {
        console.log('🎉 No Cloudinary URLs found in the database! Migration is complete.');
    } else if (mode === 'check') {
        console.log(`⚠️  Found ${total} remaining Cloudinary references.`);
        console.log('   Run with "migrate" argument to fix them:');
        console.log('   node scripts/migrate-db-images.js migrate');
    } else {
        console.log('✅ Migration complete!');
    }
}

main()
    .then(async () => { await prisma.$disconnect(); })
    .catch(async (e) => {
        console.error('\n❌ Fatal error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
