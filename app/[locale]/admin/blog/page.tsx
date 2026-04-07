"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    MessageSquare,
    FileText,
    Calendar,
    Tag,
    FolderOpen,
    Loader2,
    CheckCircle2,
    Clock,
    MoreVertical,
    Layers,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn, optimizeImage } from "@/lib/utils"
import Link from "next/link"
import { CategoryManager, TagManager } from "./_components/TaxonomyManager"
import { CommentManager } from "./_components/CommentManager"

export default function AdminBlogPage() {
    const t = useTranslations('admin.students.blog')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const router = useRouter()

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [categories, setCategories] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        setPage(1)
    }, [statusFilter, categoryFilter, search])

    useEffect(() => {
        fetchPosts()
        fetchCategories()
    }, [statusFilter, categoryFilter, search, page])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                search,
                status: statusFilter === 'all' ? '' : statusFilter,
                category: categoryFilter === 'all' ? '' : categoryFilter,
                page: page.toString(),
                limit: '50', // Fetch more at once in admin
                admin: 'true'
            })
            const res = await fetch(`/api/blog/posts?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setPosts(data.posts)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error("Failed to fetch posts", error)
            toast.error(tCommon('error'))
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

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/blog/posts/${deleteId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success(tCommon('success'))
                fetchPosts()
                setDeleteId(null)
            } else {
                toast.error(tCommon('error'))
            }
        } catch (error) {
            toast.error(tCommon('error'))
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-2">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-br from-slate-900 via-slate-700 to-indigo-950 bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link href={`/${locale}/admin/blog/new`} className="block w-full">
                        <Button className="w-full bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10 font-bold uppercase tracking-widest text-xs px-8 h-12 rounded-xl transition-all active:scale-95 group">
                            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                            {t('addPost') || "New Post"}
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="posts" className="space-y-6">
                <TabsList className="bg-slate-50/80 p-1.5 border border-slate-100 h-14 rounded-2xl shadow-inner flex w-full overflow-x-auto overflow-y-hidden justify-start no-scrollbar scroll-smooth">
                    <TabsTrigger value="posts" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-xs px-8 h-10 transition-all text-slate-500">
                        <FileText className="h-4 w-4 mr-2" />
                        Posts
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-xs px-8 h-10 transition-all text-slate-500">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-xs px-8 h-10 transition-all text-slate-500">
                        <Tag className="h-4 w-4 mr-2" />
                        Tags
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-xs px-8 h-10 transition-all text-slate-500">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-6">
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-3xl bg-white focus-within:ring-2 ring-slate-100/50 transition-all">
                        <CardHeader className="bg-white border-b border-slate-50 p-4 md:p-6">
                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <Input 
                                        placeholder={tCommon('searchPlaceholder')} 
                                        className="pl-11 h-12 rounded-xl bg-slate-50/80 border-transparent focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all w-full"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white border-slate-200 font-bold uppercase tracking-widest text-[10px] sm:text-xs h-12 px-5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                                <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                                Category: <span className="ml-1 text-slate-900">{categoryFilter === 'all' ? 'All' : categories.find((c: any) => c.slug === categoryFilter)?.name}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Filter by Category</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setCategoryFilter('all')} className="rounded-lg cursor-pointer font-medium p-3">All Categories</DropdownMenuItem>
                                            {categories.map((cat: any) => (
                                                <DropdownMenuItem key={cat.id} onClick={() => setCategoryFilter(cat.slug)} className="rounded-lg cursor-pointer font-medium p-3">
                                                    {cat.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white border-slate-200 font-bold uppercase tracking-widest text-[10px] sm:text-xs h-12 px-5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                                <Layers className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                                Status: <span className="ml-1 text-slate-900 capitalize">{statusFilter}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Filter by Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setStatusFilter('all')} className="rounded-lg cursor-pointer font-medium p-3">All Status</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter('published')} className="rounded-lg cursor-pointer font-medium p-3">Published</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter('draft')} className="rounded-lg cursor-pointer font-medium p-3">Draft</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            {/* Mobile View: List of Cards */}
                            <div className="grid grid-cols-1 md:hidden divide-y divide-slate-50">
                                {loading ? (
                                    <div className="p-16 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-300 mx-auto" />
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="p-16 text-center flex flex-col items-center gap-3">
                                        <FileText className="h-10 w-10 text-slate-100" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('noPosts')}</p>
                                    </div>
                                ) : (
                                    posts.map((post: any) => (
                                        <div key={post.id} className="p-4 bg-white active:bg-slate-50 transition-colors">
                                            <div className="flex gap-4">
                                                <div className="h-20 w-24 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
                                                    {post.featuredImage ? (
                                                        <img src={optimizeImage(post.featuredImage)} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <FileText className="h-6 w-6 text-slate-200" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight">{post.title}</h3>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 rounded-full text-slate-300">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl border-slate-100">
                                                                    <DropdownMenuItem onClick={() => router.push(`/${locale}/blog/${post.slug}`)} className="rounded-lg font-bold uppercase tracking-widest text-[10px] p-3">
                                                                        <Eye className="mr-3 h-4 w-4 text-slate-400" /> View Public
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/blog/${post.slug}`)} className="rounded-lg font-bold uppercase tracking-widest text-[10px] p-3">
                                                                        <Edit className="mr-3 h-4 w-4 text-slate-400" /> Edit Post
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="my-1 bg-slate-50" />
                                                                    <DropdownMenuItem 
                                                                        className="rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 font-bold uppercase tracking-widest text-[10px] p-3"
                                                                        onClick={() => setDeleteId(post.slug)}
                                                                    >
                                                                        <Trash2 className="mr-3 h-4 w-4" /> Delete Permanently
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            <Badge variant="secondary" className="text-[9px] font-black uppercase rounded-full bg-slate-100 text-slate-500 border-none px-2 py-0.5">
                                                                {post.category?.name}
                                                            </Badge>
                                                            <Badge className={cn(
                                                                "text-[9px] font-black uppercase border-none px-2 py-0.5 rounded-full",
                                                                post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                            )}>
                                                                {post.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" /> {post.views}</span>
                                                            <span>{new Date(post.updatedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 h-10">Post Detail</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 h-10">Category</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 h-10">Status</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 h-10 text-center">Views</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 h-10 whitespace-nowrap">Updated At</TableHead>
                                            <TableHead className="px-6 py-4 text-right h-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-64 text-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                                                </TableCell>
                                            </TableRow>
                                        ) : posts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <FileText className="h-10 w-10 text-slate-200" />
                                                        <p className="text-slate-500 font-medium">{t('noPosts')}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            posts.map((post: any) => (
                                                <TableRow key={post.id} className="hover:bg-slate-50/50 transition-colors group border-slate-100">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
                                                                {post.featuredImage ? (
                                                                    <img src={optimizeImage(post.featuredImage)} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <FileText className="h-4 w-4 text-slate-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-sm text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1">
                                                                    {post.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1 text-xs text-slate-400 tracking-wider">
                                                                        /{post.slug}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge variant="secondary" className="text-xs font-bold uppercase rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 border-transparent px-3 py-1">
                                                            {post.category?.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge className={cn(
                                                            "text-xs font-bold uppercase border-none px-3 py-1 rounded-full",
                                                            post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {post.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
                                                            <Eye className="h-3 w-3 text-slate-400" />
                                                            {post.views}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                                                                {new Date(post.updatedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB')}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                {new Date(post.updatedAt).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white text-slate-400">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl border-slate-100">
                                                                <DropdownMenuItem onClick={() => router.push(`/${locale}/blog/${post.slug}`)} className="rounded-lg font-bold uppercase tracking-widest text-[10px] p-3">
                                                                    <Eye className="mr-3 h-4 w-4 text-slate-400" /> View Public
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/blog/${post.slug}`)} className="rounded-lg font-bold uppercase tracking-widest text-[10px] p-3">
                                                                    <Edit className="mr-3 h-4 w-4 text-slate-400" /> Edit Post
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-1 bg-slate-50" />
                                                                <DropdownMenuItem 
                                                                    className="rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 font-bold uppercase tracking-widest text-[10px] p-3"
                                                                    onClick={() => setDeleteId(post.slug)}
                                                                >
                                                                    <Trash2 className="mr-3 h-4 w-4" /> Delete Permanently
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Page {page} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                            Prev
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            Next
                                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories">
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-3xl bg-white">
                        <CardHeader className="bg-white border-b border-slate-50 p-6">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                Manage Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CategoryManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tags">
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-3xl bg-white">
                        <CardHeader className="bg-white border-b border-slate-50 p-6">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                                    <Tag className="h-5 w-5" />
                                </div>
                                Manage Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <TagManager />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="comments">
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-3xl bg-white">
                        <CardHeader className="bg-white border-b border-slate-50 p-6">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                Manage Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CommentManager />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteConfirm')}</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This post will be permanently deleted from the database and storage.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
                            {tCommon('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="font-bold uppercase tracking-widest text-xs">
                            {deleteLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
