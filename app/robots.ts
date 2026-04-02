import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/og'],
      disallow: ['/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
