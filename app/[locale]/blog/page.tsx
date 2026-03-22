"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { 
    Search, 
    Filter, 
    Calendar, 
    Clock, 
    ChevronLeft,
    ChevronRight, 
    ArrowRight,
    Loader2,
    FileText,
    Tag,
    FolderOpen,
    Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn, optimizeImage } from "@/lib/utils"
import { motion } from "framer-motion"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"

export default function PublicBlogPage() {
    const t = useTranslations('nav')
    const tAdmin = useTranslations('admin.blog')
    const tCommon = useTranslations('common')
    const locale = useLocale()

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [categories, setCategories] = useState([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

    useEffect(() => {
        fetchPosts()
        fetchCategories()
    }, [categoryFilter, pagination.page])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                search,
                category: categoryFilter === 'all' ? '' : categoryFilter,
                page: pagination.page.toString(),
                limit: '9',
                status: 'published'
            })
            const res = await fetch(`/api/blog/posts?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setPosts(data.posts)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error("Failed to fetch posts", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/blog/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Failed to fetch categories", error)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <PublicNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
                
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-6 border-b-2 border-slate-900">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 bn-text uppercase tracking-tight">
                            {t('blog')}
                        </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="অনুসন্ধান করুন..." 
                                className="pl-10 h-10 rounded-none border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                            />
                        </div>
                        <select 
                            className="bg-white border text-sm border-slate-300 text-slate-700 h-10 px-3 rounded-none focus:outline-none focus:ring-emerald-600 focus:border-emerald-600 w-full sm:w-auto"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">সব বিভাগ</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-24 border-y border-slate-200">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 bn-text mb-2">কোনো লেখা পাওয়া যায়নি</h3>
                        <p className="text-slate-500">অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে খুঁজুন।</p>
                    </div>
                ) : search === "" && categoryFilter === 'all' && pagination.page === 1 && posts.length >= 4 ? (
                    /* EDITORIAL LAYOUT (bigganneshi style) */
                    <div className="space-y-16">
                        
                        {/* 1. Hero Post (Full Width) */}
                        <Link href={`/${locale}/blog/${posts[0].slug}`} className="block relative group overflow-hidden">
                            <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] w-full bg-slate-100 relative">
                                <Image 
                                    src={optimizeImage(posts[0].featuredImage, 1200)} 
                                    alt={posts[0].title} 
                                    fill
                                    className="object-cover" 
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent transition-opacity duration-300 group-hover:from-slate-900" />
                                <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-5/6 lg:w-3/4">
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none mb-4 md:mb-6 font-normal px-3 py-1.5 text-xs tracking-wider">
                                        {posts[0].category?.name || 'Uncategorized'}
                                    </Badge>
                                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white bn-text leading-[1.2] mb-4 group-hover:text-emerald-400 transition-colors">
                                        {posts[0].title}
                                    </h2>
                                    <div className="flex items-center text-slate-300 text-xs md:text-sm gap-2 bn-text">
                                        <span>{posts[0].authorName || 'Titas Team'}</span>
                                        <span>•</span>
                                        <span>{new Date(posts[0].publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* 2. Top 3 Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {posts.slice(1, 4).map((post: any) => (
                                <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group block">
                                    <div className="aspect-[16/10] bg-slate-100 mb-5 overflow-hidden relative">
                                        <Image 
                                            src={optimizeImage(post.featuredImage, 600)} 
                                            className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                            alt={post.title}
                                            fill
                                        />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 bn-text leading-[1.3] mb-3 group-hover:text-emerald-700 transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="text-slate-500 text-sm mb-3 bn-text">
                                        {new Date(post.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <p className="text-slate-600 text-base bn-text line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* 3. Latest & Trending Section */}
                        {posts.length > 4 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16 border-t border-slate-200">
                                {/* Latest (Left 2/3) */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="border-b border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-900 bn-text inline-block border-b-[3px] border-emerald-600 pb-3 -mb-[2px]">
                                            সর্বশেষ
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        {posts.slice(4).map((post: any, i: number) => (
                                            <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group block space-y-4">
                                                <div className={cn("aspect-[16/10] bg-slate-100 overflow-hidden relative", i === 0 ? "sm:aspect-[16/9]" : "")}>
                                                    <Image 
                                                        src={optimizeImage(post.featuredImage, 600)} 
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                                        alt={post.title} 
                                                        fill
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg md:text-xl font-bold text-slate-900 bn-text leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                                                        {post.title}
                                                    </h4>
                                                    <div className="text-slate-500 text-sm bn-text">
                                                        {post.authorName || 'Titas'} • {new Date(post.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Trending (Right 1/3) */}
                                <div className="space-y-8">
                                    <div className="border-b border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-900 bn-text inline-block border-b-[3px] border-emerald-600 pb-3 -mb-[2px]">
                                            ট্রেন্ডিং
                                        </h3>
                                    </div>

                                    <div className="bg-slate-900 p-8 text-white space-y-8 relative overflow-hidden">
                                        {/* Decorative Element */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                        
                                        {/* We use post views or just the oldest/random ones here for demo */}
                                        {[...posts].reverse().slice(0, 4).map((post: any, i: number) => (
                                            <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group flex flex-col gap-2 border-b border-slate-800 pb-6 last:border-0 last:pb-0 relative z-10">
                                                <div className="text-xs text-emerald-500 font-medium tracking-wider uppercase">
                                                    {post.category?.name || 'Story'}
                                                </div>
                                                <h4 className="text-lg font-bold text-white bn-text leading-snug group-hover:text-emerald-400 transition-colors">
                                                    {post.title}
                                                </h4>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* REGULAR GRID VIEW (For search/pagination) */
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post: any) => (
                                <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group block">
                                    <div className="aspect-[16/10] bg-slate-100 mb-4 overflow-hidden relative">
                                        <Image 
                                            src={optimizeImage(post.featuredImage, 600)} 
                                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt={post.title} 
                                            fill
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 bn-text leading-[1.3] mb-2 group-hover:text-emerald-700 transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="text-slate-500 text-sm mb-3 bn-text">
                                        {new Date(post.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <p className="text-slate-600 text-sm bn-text line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-12 border-t border-slate-200">
                                <Button 
                                    variant="outline" 
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    className="rounded-none border-slate-300 font-bold"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    পূর্ববর্তী
                                </Button>
                                <div className="text-slate-600 font-medium bn-text">
                                    {pagination.page} / {pagination.totalPages}
                                </div>
                                <Button 
                                    variant="outline" 
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    className="rounded-none border-slate-300 font-bold"
                                >
                                    পরবর্তী
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
