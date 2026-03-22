import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"
import { 
    Calendar, 
    Clock, 
    User, 
    ArrowLeft, 
    ChevronRight,
    MessageCircle,
    FolderOpen,
    Tag,
    Share2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SocialShare from "@/components/blog/SocialShare"
import { calculateReadingTime } from "@/lib/blog-utils"
import { Metadata } from "next"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"
import { optimizeImage } from "@/lib/utils"
import ViewCounter from "./ViewCounter"
import CommentSection from "@/components/blog/CommentSection"
import SidebarTabs from "@/components/blog/SidebarTabs"


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
    
    // Ensure OG image is an absolute URL
    let ogImage = post.featuredImage || `${baseUrl}/og-default.png`
    if (ogImage && !ogImage.startsWith('http')) {
        ogImage = `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
    }
    
    return {
        title: `${post.title} | Titas`,
        description: post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: canonicalUrl
        },
        openGraph: {
            title: post.title,
            description: post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`,
            url: canonicalUrl,
            siteName: 'Titas - Dhaka University Students\' Association of Brahmanbaria',

            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.authorName ? [post.authorName] : ['তিতাস মিডিয়া সেল'],
            locale: locale === 'bn' ? 'bn_BD' : 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || `তিতাসে ${post.title} সম্পর্কে বিস্তারিত পড়ুন।`,
            images: [ogImage]
        }
    }
}


export default async function BlogPostDetailsPage({ params }: { params: { slug: string, locale: string } }) {
    const { slug: rawSlug, locale } = params
    const slug = decodeURIComponent(rawSlug)

    const post = await prisma.blog_posts.findUnique({
        where: { slug },
        include: {
            category: true,
            tags: true,
            author: {
                select: { name: true }
            }
        }
    }) as any

    if (!post || post.status !== 'published') {
        notFound()
    }

    const related = await prisma.blog_posts.findMany({
        where: {
            id: { not: post.id },
            status: 'published',
            categoryId: post.categoryId
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
            publishedAt: true,
            readingTime: true
        }
    })

    const trending = await prisma.blog_posts.findMany({
        where: {
            status: 'published'
        },
        take: 5,
        orderBy: { views: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
            publishedAt: true,
            views: true,
            category: { select: { name: true } }
        }
    })

    const latest = await prisma.blog_posts.findMany({
        where: {
            status: 'published'
        },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
            publishedAt: true,
            category: { select: { name: true } }
        }
    })

    const initialComments = await prisma.blog_comments.findMany({
        where: { 
            postId: post.id,
            approved: true 
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            text: true,
            createdAt: true,
            likes: true,
            approved: true,
            likedBy: true
        }
    })

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://titaas.vercel.app'}/${locale}/blog/${post.slug}`

    return (
        <div className="min-h-screen bg-[#fcfcfc]">
            <PublicNav />
            
            <div className="pt-24 lg:pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-x-auto whitespace-nowrap py-2 sticky top-[80px] bg-[#fcfcfc]/80 backdrop-blur-sm z-20 md:static md:bg-transparent">
                        <Link href={`/${locale}`} className="hover:text-slate-900 transition-colors">হোম</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href={`/${locale}/blog`} className="hover:text-slate-900 transition-colors">ব্লগ</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href={`/${locale}/blog?category=${post.category?.slug}`} className="hover:text-slate-900 transition-colors">{post.category?.name}</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-slate-400 truncate max-w-[200px]">{post.title}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        
                        {/* Main Article Column */}
                        <main className="lg:col-span-8 space-y-8">
                            
                            <article className="space-y-8 bg-white p-6 sm:p-10 rounded shadow-sm border border-slate-100">
                                
                                <header className="space-y-6">
                                    <Link href={`/${locale}/blog?category=${post.category?.slug}`}>
                                        <Badge className="bg-[#00827f] hover:bg-[#006a68] text-white px-3 py-1 rounded-sm text-[11px] font-bold border-none">
                                            {post.category?.name}
                                        </Badge>
                                    </Link>

                                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a1a1a] leading-[1.3] bn-text">
                                        {post.title}
                                    </h1>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-t border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-1 bg-[#d92228] self-stretch" title="Author Identifier" role="presentation" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    লেখক
                                                </p>
                                                <p className="text-sm text-slate-500 font-medium italic">
                                                    {post.authorName || 'Titas Editorial Team'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1 sm:text-right">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">প্রকাশিতঃ</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(post.publishedAt!).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 border-y border-slate-100 py-3">
                                        <SocialShare url={shareUrl} title={post.title} />
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ViewCounter slug={post.slug} initialViews={post.views} />
                                        </div>
                                    </div>
                                </header>

                                {/* Featured Image */}
                                <div className="relative aspect-[16/9] md:aspect-[21/9] bg-slate-100 overflow-hidden">
                                    <Image 
                                        src={optimizeImage(post.featuredImage || '/blog-placeholder.jpg', 1200)} 
                                        alt={post.title} 
                                        className="object-cover" 
                                        fill
                                        priority
                                    />
                                </div>

                                {/* Body Content */}
                                <div className="blog-content bn-text prose prose-slate max-w-none md:prose-lg 
                                    prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-8
                                    prose-headings:text-[#1a1a1a] prose-headings:font-bold prose-headings:mb-6
                                    prose-img:rounded-sm prose-img:shadow-sm
                                    prose-strong:text-slate-900
                                    text-left break-words overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                <div className="text-xs text-slate-400 italic pt-4 border-t border-slate-50">
                                    ক্রেডিটঃ তিতাস মিডিয়া সেল
                                </div>

                                {/* Post Footer: Tags & Author Credits */}
                                <footer className="pt-12 border-t border-slate-100 space-y-12">
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">ট্যাগঃ</span>
                                            {post.tags.map((tag: any) => (
                                                <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
                                                    <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none px-3 py-1 rounded-sm text-[11px] font-bold cursor-pointer">
                                                        {tag.name}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Related Content */}
                                    {related.length > 0 && (
                                        <div className="space-y-6 pt-12 border-t border-slate-100">
                                            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-[#00827f] inline-block pb-1">আরও পড়ুন</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                {related.map((rel: any) => (
                                                    <Link key={rel.id} href={`/${locale}/blog/${rel.slug}`} className="group space-y-3">
                                                        <div className="aspect-[16/9] rounded overflow-hidden relative">
                                                            <Image 
                                                                src={optimizeImage(rel.featuredImage, 600)} 
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                                                alt="" 
                                                                fill
                                                            />
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#00827f] transition-colors">{rel.title}</h4>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </footer>
                            </article>

                            {/* Comment Section */}
                            <CommentSection slug={post.slug} initialComments={initialComments as any} />
                        </main>

                        {/* Sidebar Column */}
                        <aside className="lg:col-span-4 space-y-10">
                            
                            {/* Search Box */}
                            <div className="space-y-4">
                                <h3 className="text-base font-bold text-slate-900 border-b-2 border-slate-900 inline-block pb-1">যা খুঁজতে চান</h3>
                                <form className="flex gap-2" action={`/${locale}/blog`}>
                                    <input 
                                        name="q"
                                        type="text" 
                                        placeholder="অনুসন্ধান করুন..." 
                                        className="flex-1 bg-white border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00827f] rounded-sm"
                                    />
                                    <Button type="submit" className="bg-[#00827f] hover:bg-[#006a68] text-white px-6 font-bold text-xs uppercase tracking-widest rounded-sm">
                                        অনুসন্ধান
                                    </Button>
                                </form>
                            </div>

                            {/* Latest & Trending Mini List */}
                            <SidebarTabs trending={trending as any} latest={latest as any} />

                            {/* Featured Action */}
                            <div className="bg-[#00827f] p-8 rounded text-white space-y-4 relative overflow-hidden group shadow-lg">
                                <div className="relative z-10 space-y-4">
                                    <h4 className="text-2xl font-black leading-tight">শিক্ষা ও সেবায় পাশে থাকুন</h4>
                                    <p className="text-teal-50/80 text-sm font-medium">ব্রাহ্মণবাড়িয়ার অস্বচ্ছল মেধাবী শিক্ষার্থীদের সহায়তায় তিতাসের সাথে যুক্ত হন।</p>
                                    <Button className="w-full bg-white text-[#00827f] hover:bg-teal-50 font-black uppercase tracking-widest h-12 rounded-sm border-none shadow-md">
                                        সহযোগিতা করুন
                                    </Button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                            </div>
                        </aside>
                        
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}


