import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"
import { 
    Calendar, 
    Clock, 
    User, 
    ChevronRight,
    FolderOpen,
    Tag,
    Share2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SocialShare from "@/components/blog/SocialShare"
import { Metadata } from "next"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"
import { optimizeImage } from "@/lib/utils"
import ViewCounter from "./ViewCounter"
import CommentSection from "@/components/blog/CommentSection"
import SidebarTabs from "@/components/blog/SidebarTabs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(
    { params }: { params: { slug: string; locale: string } }
): Promise<Metadata> {
    const { slug: rawSlug, locale } = params
    const slug = decodeURIComponent(rawSlug)
    const post = await prisma.blog_posts.findUnique({
        where: { slug },
        include: { category: true, author: { select: { name: true } } }
    }) as any

    if (!post) return {}

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'
    const canonicalUrl = `${baseUrl}/${locale}/blog/${encodeURIComponent(post.slug)}`
    
    // Determine the ideal social image
    let sourceImage = post.featuredImage || `${baseUrl}/og-default.png`
    
    // Ensure image is absolute URL before passing to our OG Generator
    if (sourceImage && !sourceImage.startsWith('http')) {
        sourceImage = `${baseUrl}${sourceImage.startsWith('/') ? '' : '/'}${sourceImage}`
    }
    
    // The Magical Branded URL Overlay
    const ogImage = `${baseUrl}/api/og?image=${encodeURIComponent(sourceImage)}`
    
    // Sharpening the title for social
    const socialTitle = `${post.title} | Titas`
    const socialDesc = post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`
    
    return {
        title: socialTitle,
        description: socialDesc,
        metadataBase: new URL(baseUrl),
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: socialTitle,
            description: socialDesc,
            url: canonicalUrl,
            siteName: 'Titas (তিতাস)',
            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.authorName ? [post.authorName] : ['তিতাস মিডিয়া সেল'],
            locale: locale === 'bn' ? 'bn_BD' : 'en_US',
            images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }]
        },
        twitter: {
            card: 'summary_large_image',
            title: socialTitle,
            description: socialDesc,
            images: [ogImage],
            creator: '@robin_zaman', // Your handle for attribution
            site: '@titas_du'
        }
    }
}

export default async function BlogPostDetailsPage({ params }: { params: { slug: string, locale: string } }) {
    const { slug: rawSlug, locale } = params
    const slug = decodeURIComponent(rawSlug)

    const session = await getServerSession(authOptions)
    const isAdmin = !!session
    const t = await getTranslations({ locale, namespace: 'nav' })

    const post = await prisma.blog_posts.findUnique({
        where: { slug },
        include: {
            category: true,
            tags: true,
            author: { select: { name: true } }
        }
    }) as any

    if (!post || post.status !== 'published') {
        notFound()
    }

    const [related, trending, latest, initialComments] = await Promise.all([
        prisma.blog_posts.findMany({
            where: { id: { not: post.id }, status: 'published', categoryId: post.categoryId },
            take: 3,
            orderBy: { publishedAt: 'desc' },
            select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, readingTime: true }
        }),
        prisma.blog_posts.findMany({
            where: { status: 'published' },
            take: 5,
            orderBy: { views: 'desc' },
            select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, views: true, category: { select: { name: true } } }
        }),
        prisma.blog_posts.findMany({
            where: { status: 'published' },
            take: 5,
            orderBy: { publishedAt: 'desc' },
            select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, category: { select: { name: true } } }
        }),
        prisma.blog_comments.findMany({
            where: { postId: post.id, approved: true },
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, text: true, createdAt: true, likes: true, approved: true, likedBy: true }
        })
    ]);

    // Fix: We provide the raw unicode slug to shareUrl so SocialShare encodes it EXACTLY once. 
    // Double-encoding (%25) causes Facebook's composer to reject the path and default to the root domain.
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'}/${locale}/blog/${post.slug}`

    // DEEP CLEAN: Wash the content of any non-breaking spaces or invisible characters that sabotage wrapping
    const cleanedContent = post.content
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\u200B/g, '') // Zero-width spaces
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n/g, '</p><p>');

    return (
        <div className="min-h-screen bg-white">
            <PublicNav />
            
            <div className="pt-24 lg:pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Minimalist Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[14px] text-slate-500 mb-10 overflow-x-auto whitespace-nowrap px-1">
                        <Link href={`/${locale}`} className="hover:text-black transition-colors">
                            {t('home')}
                        </Link>
                        <span className="opacity-30">/</span>
                        <Link href={`/${locale}/blog`} className="hover:text-black transition-colors">
                            {t('blog')}
                        </Link>
                        <span className="opacity-30">/</span>
                        <Link 
                            href={`/${locale}/blog?category=${post.category?.slug}`} 
                            className="hover:text-black transition-colors font-medium text-slate-600"
                        >
                            {post.category?.name}
                        </Link>
                        <span className="opacity-30">/</span>
                        <span className="text-slate-400 truncate max-w-[200px] md:max-w-[400px]">
                            {post.title}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        
                        {/* Main Article Column */}
                        <main className="lg:col-span-8">
                            <article className="space-y-8">
                                
                                <header className="space-y-6">
                                    {/* Category Label */}
                                    <div>
                                        <Badge className="bg-[#008a7b] hover:bg-[#007b6d] text-white px-3 py-1 rounded-sm text-[12px] font-bold border-none uppercase tracking-tight">
                                            {post.category?.name}
                                        </Badge>
                                    </div>

                                    {/* Big Title */}
                                    <h1 className="text-4xl md:text-[46px] font-bold text-[#222] leading-[1.2] tracking-tight bn-text">
                                        {post.title}
                                    </h1>

                                    {/* Author Lead Section */}
                                    <div className="author-lead">
                                        <div className="author-label bn-text">লেখক</div>
                                        <div className="author-meta bn-text">
                                            <span className="font-bold text-[#444]">{post.authorName || 'Titas Editorial Team'}</span>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span>প্রকাশ:</span>
                                                <time>{new Date(post.publishedAt!).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rainbow Social Share Bar */}
                                    <SocialShare url={shareUrl} title={post.title} variant="newsroom" />
                                </header>

                                {/* Featured Image */}
                                <div className="relative aspect-[16/9] bg-slate-50 overflow-hidden rounded-sm">
                                    <Image 
                                        src={optimizeImage(post.featuredImage || '/blog-placeholder.jpg', 1200)} 
                                        alt={post.title} 
                                        className="object-cover" 
                                        fill
                                        priority
                                    />
                                </div>

                                {/* Body Content */}
                                <div className="pt-4">
                                    <div 
                                        className="bn-content bn-text"
                                        style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                                        dangerouslySetInnerHTML={{ __html: cleanedContent }}
                                    />

                                    <div className="flex flex-wrap items-center justify-between gap-6 mt-20 py-8 border-y border-slate-100">
                                        <div className="author-lead mb-0 py-1">
                                            <div className="text-[14px] font-bold text-[#222] uppercase tracking-wide bn-text">তথ্যসূত্র:</div>
                                            <div className="text-[14px] text-slate-500 bn-text italic">তিতাস মিডিয়া সেল / ডিজিটাল আর্কাইভস</div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[12px] font-bold text-slate-400">
                                            <ViewCounter slug={post.slug} initialViews={post.views} />
                                        </div>
                                    </div>
                                </div>

                                {/* Tags Block */}
                                <footer className="pt-8 space-y-16">
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 items-center text-sm font-bold text-slate-600">
                                            <Tag className="h-4 w-4 text-slate-400 mr-1" />
                                            <span>বিষয়:</span>
                                            {post.tags.map((tag: any, idx: number) => (
                                                <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`} className="hover:text-[#008a7b] transition-colors">
                                                    {tag.name}{idx < post.tags.length - 1 ? ',' : ''}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Related Content */}
                                    {related.length > 0 && (
                                        <div className="space-y-10 pt-16 border-t border-slate-100">
                                            <div className="flex items-center gap-6">
                                                <h3 className="text-2xl font-bold text-[#222] tracking-tight">আরও পড়ুন</h3>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                                                {related.map((rel: any) => (
                                                    <Link key={rel.id} href={`/${locale}/blog/${rel.slug}`} className="group block space-y-4">
                                                        <div className="aspect-[16/9] rounded-sm overflow-hidden relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                                                            <Image 
                                                                src={optimizeImage(rel.featuredImage, 600)} 
                                                                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                                                alt="" 
                                                                fill
                                                            />
                                                        </div>
                                                        <h4 className="text-[15px] font-bold text-[#333] line-clamp-3 leading-relaxed group-hover:text-[#008a7b] transition-all duration-300">{rel.title}</h4>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </footer>
                            </article>

                            {/* Comment Section */}
                            <div className="mt-16 pt-16 border-t border-slate-100">
                                <CommentSection slug={post.slug} initialComments={initialComments as any} />
                            </div>
                        </main>

                        {/* Sidebar Column */}
                        <aside className="lg:col-span-4 space-y-12">
                            {/* Modern Search */}
                            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-bold text-[#222]">সার্চ করুন</h3>
                                </div>
                                <form className="flex gap-2" action={`/${locale}/blog`}>
                                    <input 
                                        name="q"
                                        type="text" 
                                        placeholder="খুঁজুন..." 
                                        className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-200 rounded-sm"
                                    />
                                    <Button type="submit" className="bg-[#008a7b] hover:bg-[#007b6d] text-white px-5 rounded-sm font-bold text-xs">
                                        গমন
                                    </Button>
                                </form>
                            </div>

                            {/* Sidebar Content Tabs */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <SidebarTabs trending={trending as any} latest={latest as any} />
                            </div>

                            {/* Action Card */}
                            <div className="bg-[#008a7b] p-10 rounded-xl text-white space-y-6 relative overflow-hidden shadow-xl shadow-[#008a7b]/10">
                                <div className="relative z-10 space-y-6">
                                    <h4 className="text-3xl font-bold leading-tight">শিক্ষা ও সেবায় পাশে থাকুন</h4>
                                    <p className="text-white/80 text-sm font-medium leading-relaxed">ব্রাহ্মণবাড়িয়ার অস্বচ্ছল মেধাবী শিক্ষার্থীদের সহায়তায় তিতাসের সাথে যুক্ত হন।</p>
                                    <Button className="w-full bg-white text-[#008a7b] hover:bg-slate-50 font-bold h-14 rounded-sm text-lg mt-4 bn-text tracking-tight">
                                        সহযোগিতা করুন
                                    </Button>
                                </div>
                                <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-white/5 rounded-full blur-3xl" />
                            </div>
                        </aside>
                        
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
