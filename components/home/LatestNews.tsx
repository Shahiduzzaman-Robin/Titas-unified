"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, optimizeImage } from "@/lib/utils"

interface Post {
    id: number
    title: string
    slug: string
    excerpt: string
    featuredImage: string
    publishedAt: string
    category: {
        name: string
        slug: string
    }
}

export default function LatestNews() {
    const t = useTranslations('public.blog')
    const locale = useLocale()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`/api/blog/posts?limit=3&status=published`)
                if (res.ok) {
                    const data = await res.json()
                    setPosts(data.posts)
                }
            } catch (error) {
                console.error("Failed to fetch latest news", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    if (loading) {
        return (
            <div className="grid md:grid-cols-3 gap-8 py-10 opacity-50">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-[400px] bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (posts.length === 0) return null

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
                    <div>
                        <div className="section-label mx-auto md:mx-0">News</div>
                        <h2 className={cn("text-3xl font-bold text-slate-900 mb-2", locale === 'bn' && "bn-text")}>
                            {locale === 'bn' ? 'সর্বশেষ সংবাদ ও আপডেট' : 'Latest News & Updates'}
                        </h2>
                        <p className={cn("text-slate-500 max-w-xl", locale === 'bn' && "bn-text")}>
                            {locale === 'bn' 
                                ? 'আমাদের সর্বশেষ কার্যক্রম এবং ঘোষণা সম্পর্কে নিয়মিত আপডেট পেতে আমাদের সাথে থাকুন।' 
                                : 'Stay informed about our latest activities and announcements'}
                        </p>
                    </div>
                    <Link href={`/${locale}/blog`} className="hidden md:block">
                        <Button variant="ghost" className={cn("group gap-2 hover:bg-primary/5 hover:text-primary", locale === 'bn' && "bn-text")}>
                            {locale === 'bn' ? 'সব ব্লগ দেখুন' : 'View All News'}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link 
                            key={post.id} 
                            href={`/blog/${post.slug}`}
                            className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="relative h-56 w-full">
                                {post.featuredImage ? (
                                    <Image 
                                        src={optimizeImage(post.featuredImage, 600)} 
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                                        <Image src="https://pub-91170e9e74d646aeb556b9262e82bbbf.r2.dev/assets/brand/logo.png" alt="Logo" width={40} height={40} className="opacity-20 grayscale" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider shadow-sm">
                                        {post.category.name}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Recently'}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="flex justify-center mt-12 md:hidden">
                    <Link href={`/${locale}/blog`}>
                        <Button variant="outline" className={cn("group gap-2 px-8 py-6 rounded-full border-2 hover:bg-primary hover:text-white transition-all duration-300", locale === 'bn' && "bn-text")}>
                            {locale === 'bn' ? 'সব ব্লগ দেখুন' : 'View All News'}
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
