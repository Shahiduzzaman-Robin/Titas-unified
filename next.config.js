const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        // Disable image optimization to avoid Vercel free tier limits
        // Images are already optimized and served from Cloudflare R2
        unoptimized: true,
    },
};

module.exports = withNextIntl(nextConfig);
