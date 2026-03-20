"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
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
import { cn } from "@/lib/utils"
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                {/* Hero Section */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-200 p-8 md:p-16 mb-16">
                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                        <Badge variant="outline" className="text-slate-900 border-slate-900/10 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2">
                            Our Stories
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Explore the Titas Journey
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium">
                            Discover stories, news, and insights from the heart of our vibrant student community.
                        </p>
                        
                        <div className="max-w-xl mx-auto pt-4 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <Input 
                                placeholder="Search stories..." 
                                className="h-16 pl-14 pr-6 rounded-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-0 transition-all text-base font-medium shadow-sm hover:border-slate-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1 space-y-10">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-4">
                                        <div className="aspect-[16/9] bg-slate-100 rounded-2xl animate-pulse" />
                                        <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse" />
                                        <div className="h-8 w-3/4 bg-slate-100 rounded animate-pulse" />
                                        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">No Stories Found</h3>
                                <p className="text-slate-500 font-medium">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                {posts.map((post: any, index: number) => (
                                    <motion.article 
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group cursor-pointer"
                                    >
                                        <Link href={`/${locale}/blog/${post.slug}`}>
                                            <div className="space-y-5">
                                                <div className="relative aspect-[1.91/1] rounded-2xl overflow-hidden bg-slate-100 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                                    <img 
                                                        src={post.featuredImage || '/blog-placeholder.jpg'} 
                                                        alt={post.title} 
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                    />
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="bg-slate-900 text-white border-none font-black uppercase tracking-widest text-[10px] px-3 py-1">
                                                            {post.category?.name}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(post.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-3 w-3" />
                                                            {post.readingTime} MIN READ
                                                        </span>
                                                    </div>
                                                    
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase group-hover:text-slate-600 transition-colors bn-text">
                                                        {post.title}
                                                    </h2>
                                                    
                                                    <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed text-sm bn-text">
                                                        {post.excerpt}
                                                    </p>
                                                    
                                                    <div className="pt-2 flex items-center gap-2 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] group-hover:gap-3 transition-all">
                                                        Read Story
                                                        <ArrowRight className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-12">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    className="rounded-full h-12 w-12 border-slate-200"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-2 text-sm font-bold mx-4">
                                    <span className="text-slate-900">{pagination.page}</span>
                                    <span className="text-slate-300">/</span>
                                    <span className="text-slate-900">{pagination.totalPages}</span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    className="rounded-full h-12 w-12 border-slate-200"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-12">
                        {/* Categories */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-slate-900" />
                                Categories
                            </h3>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => setCategoryFilter('all')}
                                    className={cn(
                                        "flex justify-between items-center px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-tight text-sm",
                                        categoryFilter === 'all' 
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1" 
                                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                                    )}
                                >
                                    All Stories
                                    <span className={cn("text-[10px] font-black", categoryFilter === 'all' ? "text-slate-400" : "text-slate-300")}>
                                        {posts.length}+
                                    </span>
                                </button>
                                {categories.map((cat: any) => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setCategoryFilter(cat.slug)}
                                        className={cn(
                                            "flex justify-between items-center px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-tight text-sm",
                                            categoryFilter === cat.slug 
                                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1" 
                                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                                        )}
                                    >
                                        {cat.name}
                                        <span className={cn("text-[10px] font-black", categoryFilter === cat.slug ? "text-slate-400" : "text-slate-300")}>
                                            {cat._count?.posts || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Featured Post (Most Viewed) */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Eye className="h-4 w-4 text-slate-900" />
                                Trending
                            </h3>
                            <div className="space-y-6">
                                {posts.slice(0, 3).map((post: any) => (
                                    <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group flex gap-4">
                                        <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                            <img src={post.featuredImage} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-sm font-black text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-2 uppercase leading-tight tracking-tight bn-text">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Calendar className="h-2.5 w-2.5" />
                                                {new Date(post.publishedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
