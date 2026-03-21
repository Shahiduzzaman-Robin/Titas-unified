import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
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

// View Counter Component (Client Side)
import ViewCounter from "./ViewCounter"


export async function generateMetadata(
    { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
    const { slug, locale } = await params
    const post = await prisma.blog_posts.findUnique({
        where: { slug },
        include: { category: true, author: { select: { name: true } } }
    }) as any

    if (!post) return {}

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titasdu.com'
    const canonicalUrl = `${baseUrl}/${locale}/blog/${post.slug}`
    const ogImage = post.featuredImage || `${baseUrl}/og-default.png`
    
    return {
        title: `${post.title} | TITAS Blog`,
        description: post.excerpt || `Read about ${post.title} on TITAS`,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: canonicalUrl
        },
        openGraph: {
            title: post.title,
            description: post.excerpt || `Read about ${post.title} on TITAS`,
            url: canonicalUrl,
            siteName: 'TITAS - Dhaka University Students\' Welfare Association of Brahmanbaria',
            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.authorName ? [post.authorName] : ['Titas Editorial Team'],
            locale: locale === 'bn' ? 'bn_BD' : 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                    type: 'image/jpeg'
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || `Read about ${post.title} on TITAS`,
            images: [ogImage]
        }
    }
}

export default async function BlogPostDetailsPage({ params }: { params: { slug: string, locale: string } }) {
    const { slug, locale } = params

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

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://titasdu.com'}/${locale}/blog/${post.slug}`

    return (
        <div className="min-h-screen bg-white">
            <PublicNav />
            <div className="pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-12">
                    <Link href={`/${locale}/blog`}>
                        <Button variant="ghost" className="rounded-full pl-2 pr-6 h-12 hover:bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs group">
                            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Back to Feed
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-16 max-w-4xl mx-auto">
                    {/* Main Content */}
                    <div className="w-full">
                        <article className="space-y-12">
                            {/* Header */}
                            <header className="space-y-8 max-w-[65ch] mx-auto w-full text-center">
                                <Badge className="bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2 border-none">
                                    {post.category?.name}
                                </Badge>
                                
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] uppercase bn-text">
                                    {post.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center gap-6 py-8 border-t border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center bg-slate-100 text-slate-900 font-black rounded-full border border-slate-200">
                                            {(post.authorName || post.author?.name || 'A')[0]}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-slate-900 leading-none">{post.authorName || 'Titas Editorial Team'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Author</p>
                                        </div>
                                    </div>

                                    <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />

                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-900" />
                                            {new Date(post.publishedAt!).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-900" />
                                            {post.readingTime} MIN READ
                                        </div>
                                        <ViewCounter slug={slug} initialViews={post.views ?? 0} />
                                    </div>
                                </div>
                            </header>

                            {/* Featured Image */}
                            <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-100 border-8 border-white">
                                <img 
                                    src={post.featuredImage || '/blog-placeholder.jpg'} 
                                    alt={post.title} 
                                    className="h-full w-full object-cover" 
                                />
                            </div>

                            {/* Content */}
                            <div className="bg-slate-50/80 rounded-[2.5rem] p-6 sm:p-10 md:p-16 shadow-sm border border-slate-100 max-w-4xl mx-auto w-full overflow-hidden">
                                <div 
                                    className="blog-content bn-text w-full mx-auto prose prose-slate md:prose-lg max-w-[65ch] break-words prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed prose-p:text-slate-700 prose-a:text-indigo-600 prose-img:rounded-2xl prose-img:shadow-lg text-left"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>

                            {/* Tags & Footer */}
                            <footer className="pt-12 border-t border-slate-100 space-y-10 max-w-[65ch] mx-auto">
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag: any) => (
                                        <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
                                            <Badge variant="outline" className="px-4 py-2 rounded-full border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors font-bold uppercase tracking-widest text-[9px] cursor-pointer">
                                                #{tag.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>

                                <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">Inspiring Story?</h4>
                                        <p className="text-slate-500 font-medium">Spread the knowledge with your circle.</p>
                                    </div>
                                    <SocialShare url={shareUrl} title={post.title} />
                                </div>
                            </footer>
                        </article>
                    </div>

                    {/* Bottom Section (Formerly Sidebar) */}
                    <aside className="w-full space-y-16 pt-16 border-t border-slate-100">
                        {/* Related Stories */}
                        {related.length > 0 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-slate-900" />
                                        Keep Reading
                                    </h3>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">Related Stories</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    {related.map((rel: any) => (
                                        <Link key={rel.id} href={`/${locale}/blog/${rel.slug}`} className="group block space-y-4">
                                            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 shadow-md group-hover:shadow-xl transition-all duration-500">
                                                <img src={rel.featuredImage} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-slate-600 transition-colors">
                                                    {rel.title}
                                                </h4>
                                                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-2.5 w-2.5" />
                                                        {new Date(rel.publishedAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="h-0.5 w-0.5 bg-slate-300 rounded-full" />
                                                    <span>{rel.readingTime} MIN READ</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Newsletter/Action */}
                        <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 md:p-16 space-y-6 relative overflow-hidden group max-w-2xl mx-auto shadow-sm">
                            <div className="relative z-10 space-y-6 text-center">
                                <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm group-hover:border-slate-300 transition-colors">
                                    <Share2 className="h-10 w-10 text-slate-900" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-3">Stay Connected</h4>
                                    <p className="text-slate-500 text-base font-medium max-w-sm mx-auto">Join our community for regular updates and exclusive stories straight to your inbox.</p>
                                </div>
                                <Button className="w-full sm:w-auto px-12 bg-slate-900 text-white hover:bg-slate-800 transition-colors font-bold uppercase tracking-widest text-xs h-14 rounded-xl">
                                    Support Titas
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
