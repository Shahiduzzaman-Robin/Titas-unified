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
    FileText,
    Calendar,
    Tag,
    FolderOpen,
    Loader2,
    CheckCircle2,
    Clock,
    MoreVertical,
    Layers
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
import { cn } from "@/lib/utils"
import Link from "next/link"
import { CategoryManager, TagManager } from "./_components/TaxonomyManager"

export default function AdminBlogPage() {
    const t = useTranslations('admin.blog')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const router = useRouter()

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [categories, setCategories] = useState([])
    
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        fetchPosts()
        fetchCategories()
    }, [statusFilter, categoryFilter, search])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                search,
                status: statusFilter === 'all' ? '' : statusFilter,
                category: categoryFilter === 'all' ? '' : categoryFilter,
                admin: 'true'
            })
            const res = await fetch(`/api/blog/posts?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setPosts(data.posts)
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}/admin/blog/new`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-bold uppercase tracking-widest text-[10px] px-6">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addPost') || "New Post"}
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="posts" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1 border h-11">
                    <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] px-8 h-9">
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Posts
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] px-8 h-9">
                        <FolderOpen className="h-3.5 w-3.5 mr-2" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] px-8 h-9">
                        <Tag className="h-3.5 w-3.5 mr-2" />
                        Tags
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        placeholder={tCommon('searchPlaceholder')} 
                                        className="pl-9 bg-white border-slate-200 focus:ring-indigo-500"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-white border-slate-200 font-bold uppercase tracking-widest text-[10px] h-10 px-4">
                                                <Filter className="w-3.5 h-3.5 mr-2" />
                                                Category: {categoryFilter === 'all' ? 'All' : categories.find((c: any) => c.slug === categoryFilter)?.name}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => setCategoryFilter('all')}>All Categories</DropdownMenuItem>
                                            {categories.map((cat: any) => (
                                                <DropdownMenuItem key={cat.id} onClick={() => setCategoryFilter(cat.slug)}>
                                                    {cat.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-white border-slate-200 font-bold uppercase tracking-widest text-[10px] h-10 px-4">
                                                <Layers className="w-3.5 h-3.5 mr-2" />
                                                Status: {statusFilter}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter('published')}>Published</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Post Detail</TableHead>
                                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</TableHead>
                                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Views</TableHead>
                                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</TableHead>
                                            <TableHead className="px-6 py-4 text-right"></TableHead>
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
                                                <TableRow key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-20 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                                                {post.featuredImage ? (
                                                                    <img src={post.featuredImage} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <FileText className="h-5 w-5 text-slate-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 truncate uppercase tracking-tight text-xs group-hover:text-indigo-600 transition-colors">
                                                                    {post.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                                                                        /{post.slug}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50 border-slate-200 text-slate-600 px-2 py-0.5">
                                                            {post.category?.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge className={cn(
                                                            "text-[9px] font-bold uppercase border-none px-2 py-0.5",
                                                            post.status === 'published' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
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
                                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                                                {new Date(post.updatedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB')}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
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
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => router.push(`/${locale}/blog/${post.slug}`)} className="font-bold uppercase tracking-widest text-[9px]">
                                                                    <Eye className="mr-2 h-3.5 w-3.5" /> View Public
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/blog/${post.slug}`)} className="font-bold uppercase tracking-widest text-[9px]">
                                                                    <Edit className="mr-2 h-3.5 w-3.5" /> Edit Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 font-bold uppercase tracking-widest text-[9px]"
                                                                    onClick={() => setDeleteId(post.slug)}
                                                                >
                                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Permanently Delete
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
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-indigo-500" />
                                Manage Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CategoryManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tags">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Tag className="h-4 w-4 text-indigo-500" />
                                Manage Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <TagManager />
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
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="font-bold uppercase tracking-widest text-[10px]">
                            {deleteLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
