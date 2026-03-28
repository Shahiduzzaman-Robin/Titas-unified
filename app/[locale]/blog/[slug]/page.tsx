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

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
    const { slug: rawSlug, locale } = await params
    const slug = decodeURIComponent(rawSlug)
    const post = await prisma.blog_posts.findUnique({
        where: { slug },
        include: { category: true, author: { select: { name: true } } }
    }) as any

    if (!post) return {}

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'
    const canonicalUrl = `${baseUrl}/${locale}/blog/${post.slug}`
    let ogImage = post.featuredImage || `${baseUrl}/og-default.png`
    
    if (ogImage && ogImage.includes('cloudinary.com')) {
        if (ogImage.includes('/upload/')) {
            ogImage = ogImage.replace('/upload/', '/upload/c_fill,ar_1.91,w_1200,h_630,g_auto,f_auto,q_auto/')
        }
    } else if (ogImage && !ogImage.startsWith('http')) {
        ogImage = `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
    }
    
    return {
        title: `${post.title} | Titas`,
        description: post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`,
        metadataBase: new URL(baseUrl),
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: post.title,
            description: post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`,
            url: canonicalUrl,
            siteName: 'Titas',
            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.authorName ? [post.authorName] : ['তিতাস মিডিয়া সেল'],
            locale: locale === 'bn' ? 'bn_BD' : 'en_US',
            images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }]
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`,
            images: [ogImage],
            creator: '@titas_du'
        }
    }
}

export default async function BlogPostDetailsPage({ params }: { params: { slug: string, locale: string } }) {
    const { slug: rawSlug, locale } = params
    const slug = decodeURIComponent(rawSlug)

    const session = await getServerSession(authOptions)
    const isAdmin = !!session

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

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'}/${locale}/blog/${post.slug}`

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <PublicNav />
            
            <div className="pt-24 lg:pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Simplified Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-10 overflow-x-auto whitespace-nowrap py-1">
                        <Link href={`/${locale}`} className="hover:text-[#00827f] transition-colors">HOME</Link>
                        <ChevronRight className="h-2.5 w-2.5 opacity-20" />
                        <Link href={`/${locale}/blog`} className="hover:text-[#00827f] transition-colors">BLOG</Link>
                        <ChevronRight className="h-2.5 w-2.5 opacity-20" />
                        <span className="text-slate-900 truncate max-w-[200px]">{post.title}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        
                        {/* Main Article Column */}
                        <main className="lg:col-span-8">
                            <article className="bg-white rounded-[2rem] shadow-sm border border-slate-100/60 overflow-hidden">
                                
                                {/* Refined Header */}
                                <header className="p-6 sm:p-12 pb-0 sm:pb-0 space-y-12">
                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link href={`/${locale}/blog?category=${post.category?.slug}`}>
                                                <Badge className="bg-[#00827f] hover:bg-[#006a68] text-white px-5 py-2 rounded-full text-[10px] font-black border-none uppercase tracking-widest shadow-lg shadow-[#00827f]/10">
                                                    {post.category?.name}
                                                </Badge>
                                            </Link>
                                            <div className="flex items-center gap-4 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(post.publishedAt!).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-100 rounded-full" />
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {post.readingTime || 5} MIN
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100/50">
                                            <ViewCounter slug={post.slug} initialViews={post.views} />
                                        </div>
                                    </div>

                                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight bn-text">
                                        {post.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center justify-between gap-8 py-10 border-y border-slate-50">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#00827f] border border-slate-100 shadow-inner group transition-all duration-500 hover:rounded-full">
                                                <User className="h-7 w-7 transition-transform group-hover:scale-110" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-1.5">PUBLISHED BY</p>
                                                <p className="text-lg font-black text-slate-900 leading-none">
                                                    {post.authorName || 'Titas Editorial Team'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-5">
                                            <SocialShare url={shareUrl} title={post.title} />
                                            {isAdmin && (
                                                <Link href={`/${locale}/admin/blog/${post.slug}`}>
                                                    <Button variant="outline" size="sm" className="h-11 gap-2 border-slate-200 text-slate-600 hover:border-[#00827f] hover:text-[#00827f] font-black px-6 rounded-2xl transition-all active:scale-95 shadow-sm">
                                                        EDIT POST
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </header>

                                {/* Featured Image - Perfectly Styled */}
                                <div className="p-6 sm:p-12 pt-0 sm:pt-0">
                                    <div className="relative aspect-[16/9] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                                        <Image 
                                            src={optimizeImage(post.featuredImage || '/blog-placeholder.jpg', 1200)} 
                                            alt={post.title} 
                                            className="object-cover" 
                                            fill
                                            priority
                                        />
                                    </div>
                                </div>

                                {/* Body Content - BENGALI EXCELLENCE (REBUILT) */}
                                <div className="p-6 sm:p-12 sm:pt-0">
                                    <div 
                                        className="bn-content bn-text"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />

                                    <div className="flex items-center justify-between gap-6 mt-20 pt-10 border-t border-slate-50">
                                        <div className="text-[11px] font-black text-slate-300 italic tracking-[0.2em] uppercase">
                                            Credit: Titas Media Cell
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Share2 className="h-4 w-4 text-slate-300" />
                                            <div className="h-px w-12 bg-slate-100" />
                                        </div>
                                    </div>
                                </div>

                                {/* Tags Block */}
                                <footer className="p-6 sm:p-12 pt-0 sm:pt-0 pb-16 space-y-16">
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                                            <Tag className="h-4 w-4 text-[#00827f] mr-2" />
                                            {post.tags.map((tag: any) => (
                                                <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
                                                    <span className="bg-white hover:bg-[#00827f] hover:text-white border border-slate-100/50 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm">
                                                        #{tag.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Related Content - Magazine Grid */}
                                    {related.length > 0 && (
                                        <div className="space-y-12 pt-16 border-t border-slate-100">
                                            <div className="flex items-center gap-8">
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">আরও পড়ুন</h3>
                                                <div className="h-[3px] flex-1 bg-gradient-to-r from-slate-100 via-slate-50 to-transparent" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                                                {related.map((rel: any) => (
                                                    <Link key={rel.id} href={`/${locale}/blog/${rel.slug}`} className="group block space-y-6">
                                                        <div className="aspect-[1.25/1] rounded-3xl overflow-hidden relative shadow-lg shadow-slate-200/40">
                                                            <Image 
                                                                src={optimizeImage(rel.featuredImage, 600)} 
                                                                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                                                alt="" 
                                                                fill
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <h4 className="text-sm font-black text-slate-900 line-clamp-3 leading-relaxed group-hover:text-[#00827f] transition-all duration-300">{rel.title}</h4>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </footer>
                            </article>

                            {/* Comment Section */}
                            <div className="mt-16">
                                <CommentSection slug={post.slug} initialComments={initialComments as any} />
                            </div>
                        </main>

                        {/* Sidebar Column - Unified & Floating */}
                        <aside className="lg:col-span-4 space-y-12">
                            
                            {/* Modern Search */}
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/40 space-y-10 group hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-[#f8fafc] flex items-center justify-center text-[#00827f] shadow-inner">
                                        <FolderOpen className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">সার্চ করুন</h3>
                                </div>
                                <form className="flex flex-col gap-4" action={`/${locale}/blog`}>
                                    <input 
                                        name="q"
                                        type="text" 
                                        placeholder="অনুসন্ধান করুন..." 
                                        className="w-full bg-[#f8fafc] border border-slate-100 px-6 py-5 text-sm outline-none focus:ring-2 focus:ring-[#00827f]/10 rounded-2xl transition-all"
                                    />
                                    <Button type="submit" className="w-full bg-[#00827f] hover:bg-[#006a68] text-white py-6 rounded-2xl shadow-xl shadow-[#00827f]/30 font-black text-xs uppercase tracking-[0.3em]">
                                        SEARCH
                                    </Button>
                                </form>
                            </div>

                            {/* Tabs Box */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/40 overflow-hidden p-3 group hover:shadow-xl transition-all duration-500">
                                <SidebarTabs trending={trending as any} latest={latest as any} />
                            </div>

                            {/* Premium Action Card */}
                            <div className="bg-slate-900 p-12 rounded-[3rem] text-white space-y-10 relative overflow-hidden shadow-2xl shadow-slate-900/40 border border-white/5">
                                <div className="relative z-10 space-y-10">
                                    <h4 className="text-4xl font-black leading-[1.05] tracking-tight">শিক্ষা ও সেবায় পাশে থাকুন</h4>
                                    <div className="h-1 w-12 bg-[#00827f]" />
                                    <p className="text-slate-400 text-lg font-medium leading-relaxed">ব্রাহ্মণবাড়িয়ার অস্বচ্ছল মেধাবী শিক্ষার্থীদের সহায়তায় তিতাসের সাথে যুক্ত হন।</p>
                                    <Button className="w-full bg-[#00827f] hover:bg-[#006a68] text-white font-black uppercase tracking-[0.4em] h-20 rounded-3xl shadow-2xl shadow-[#00827f]/40 transition-all text-[11px] border-none">
                                        সহযোগিতা করুন
                                    </Button>
                                </div>
                                {/* Abstract Shapes */}
                                <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-[#00827f]/20 rounded-full blur-[100px]" />
                                <div className="absolute top-10 right-10 h-32 w-32 bg-teal-400/5 rounded-full blur-[60px]" />
                            </div>
                        </aside>
                        
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
