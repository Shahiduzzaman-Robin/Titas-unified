import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'
  const locales = ['bn', 'en']
  
  // 1. Static Pages
  const staticPaths = ['', '/blog', '/events', '/gallery', '/register', '/about']
  const staticSitemaps = staticPaths.flatMap((path) => 
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  )

  // 2. Dynamic Blog Posts
  try {
    const posts = await prisma.blog_posts.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true }
    })
    
    const blogSitemaps = posts.flatMap((post) => 
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    )

    return [...staticSitemaps, ...blogSitemaps]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticSitemaps
  }
}
