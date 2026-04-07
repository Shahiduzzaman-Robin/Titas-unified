/**
 * Migrate static/hardcoded Cloudinary images to Cloudflare R2
 * 
 * This script downloads images from Cloudinary and uploads them to R2
 * with organized paths, then prints the new URLs to use in the codebase.
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

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

// Map of Cloudinary URLs to desired R2 keys
const IMAGES_TO_MIGRATE = [
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774173529/titas/brand/logo.png',
        r2Key: 'assets/brand/logo.png',
        label: 'Brand Logo',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774169441/titas/slider/slider-1.jpg',
        r2Key: 'assets/slider/slider-1.jpg',
        label: 'Slider 1',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774169448/titas/slider/slider-2.jpg',
        r2Key: 'assets/slider/slider-2.jpg',
        label: 'Slider 2',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774169449/titas/slider/slider-3.jpg',
        r2Key: 'assets/slider/slider-3.jpg',
        label: 'Slider 3',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774169451/titas/slider/slider-4.jpg',
        r2Key: 'assets/slider/slider-4.jpg',
        label: 'Slider 4',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774169453/titas/slider/slider-5.jpg',
        r2Key: 'assets/slider/slider-5.jpg',
        label: 'Slider 5',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774169454/titas/slider/slider-6.jpg',
        r2Key: 'assets/slider/slider-6.jpg',
        label: 'Slider 6',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774170410/titas/hero/Fruit_Fest.jpg',
        r2Key: 'assets/hero/Fruit_Fest.jpg',
        label: 'Hero Image (Fruit Fest)',
    },
    {
        source: 'https://res.cloudinary.com/dwybib7hh/image/upload/v1774170361/titas/about/aboutus.jpg',
        r2Key: 'assets/about/aboutus.jpg',
        label: 'About Us Image',
    },
];

function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

async function downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

async function uploadToR2(buffer, key, contentType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });
    await s3Client.send(command);
}

async function main() {
    console.log('🚀 Starting static image migration: Cloudinary → Cloudflare R2\n');
    console.log(`   Bucket: ${BUCKET}`);
    console.log(`   Public URL: ${PUBLIC_URL}\n`);

    let success = 0;
    let failed = 0;
    const results = [];

    for (const img of IMAGES_TO_MIGRATE) {
        process.stdout.write(`📦 ${img.label} (${img.r2Key})... `);
        try {
            // Download from Cloudinary
            const buffer = await downloadImage(img.source);
            const contentType = getMimeType(img.r2Key);

            // Upload to R2
            await uploadToR2(buffer, img.r2Key, contentType);

            const newUrl = `${PUBLIC_URL}/${img.r2Key}`;
            results.push({ label: img.label, oldUrl: img.source, newUrl, r2Key: img.r2Key });
            console.log(`✅ (${(buffer.length / 1024).toFixed(1)} KB)`);
            success++;
        } catch (error) {
            console.log(`❌ ${error.message}`);
            failed++;
        }

        // Small delay to be nice to servers
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Migration complete: ${success} succeeded, ${failed} failed\n`);

    if (results.length > 0) {
        console.log('📋 URL Mapping (old → new):\n');
        for (const r of results) {
            console.log(`   ${r.label}:`);
            console.log(`     Old: ${r.oldUrl}`);
            console.log(`     New: ${r.newUrl}`);
            console.log();
        }
    }
}

main().catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
});
