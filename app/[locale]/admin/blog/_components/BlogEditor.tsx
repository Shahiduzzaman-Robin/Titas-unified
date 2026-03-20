"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { 
    Save, 
    X, 
    Upload, 
    Loader2, 
    Image as ImageIcon,
    Type,
    FileText,
    FolderOpen,
    Tag,
    Eye,
    Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-50 flex items-center justify-center border rounded-md"><Loader2 className="animate-spin text-slate-300" /></div>
})

import "react-quill-new/dist/quill.snow.css"

interface BlogEditorProps {
    initialData?: any
    categories: any[]
    tags: any[]
    isEditing?: boolean
}

export default function BlogEditor({ initialData, categories, tags, isEditing = false }: BlogEditorProps) {
    const t = useTranslations('admin.blog')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(initialData?.title || "")
    const [content, setContent] = useState(initialData?.content || "")
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
    const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() || "")
    const [status, setStatus] = useState(initialData?.status || "draft")
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
        initialData?.tags?.map((t: any) => t.id) || []
    )
    
    const [featuredImage, setFeaturedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.featuredImage || null)

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    }), [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFeaturedImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const toggleTag = (id: number) => {
        setSelectedTagIds(prev => 
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !content || !categoryId) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('content', content)
            formData.append('excerpt', excerpt)
            formData.append('categoryId', categoryId)
            formData.append('status', status)
            formData.append('tagIds', JSON.stringify(selectedTagIds))
            
            if (featuredImage) {
                formData.append('featuredImage', featuredImage)
            }

            const url = isEditing 
                ? `/api/blog/posts/${initialData.slug}`
                : '/api/blog/posts'
            
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                body: formData
            })

            if (res.ok) {
                toast.success(isEditing ? "Post updated" : "Post created")
                router.push(`/${locale}/admin/blog`)
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to save post")
            }
        } catch (error) {
            console.error("Save error:", error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main content */}
                <div className="flex-1 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Type className="h-4 w-4 text-indigo-500" />
                                Content Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    Post Title <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a compelling title..."
                                    className="text-lg font-medium h-12 border-slate-200 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    Post Content <span className="text-red-500">*</span>
                                </label>
                                <div className="prose prose-slate max-w-none">
                                    <ReactQuill 
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        className="h-96 mb-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    Excerpt (Short Summary)
                                </label>
                                <Textarea 
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Brief summary for list views..."
                                    className="h-24 resize-none border-slate-200 focus:ring-indigo-500"
                                />
                                <p className="text-[10px] text-slate-400 font-medium">Leave empty to auto-generate from content.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-96 space-y-6">
                    {/* Status & Category */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500">
                                <FolderOpen className="h-4 w-4 text-indigo-500" />
                                Publishing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Category <span className="text-red-500">*</span></label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat: any) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500">
                                <ImageIcon className="h-4 w-4 text-indigo-500" />
                                Featured Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {previewUrl ? (
                                <div className="space-y-3">
                                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                        <button 
                                            type="button"
                                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-sm"
                                            onClick={() => {
                                                setFeaturedImage(null)
                                                setPreviewUrl(null)
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full text-[10px] font-bold uppercase tracking-wider"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                    >
                                        Change Image
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    className="aspect-[16/9] rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-indigo-50 transition-colors">
                                        <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Header Image</p>
                                    <p className="text-[8px] text-slate-300 mt-1">Recommended: 1200x630 (1.91:1)</p>
                                </div>
                            )}
                            <Input 
                                id="image-upload"
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500">
                                <Tag className="h-4 w-4 text-indigo-500" />
                                Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                                {tags.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 italic">No tags available</p>
                                ) : (
                                    tags.map((tag: any) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={cn(
                                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 border",
                                                selectedTagIds.includes(tag.id)
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                                            )}
                                        >
                                            {selectedTagIds.includes(tag.id) && <Check className="w-2.5 h-2.5" />}
                                            {tag.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sticky bottom-4">
                        <Button 
                            type="submit" 
                            className="bg-indigo-600 hover:bg-indigo-700 h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-200"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isEditing ? "Update Post" : "Publish Post"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="h-10 text-[10px] font-bold uppercase tracking-wider border-slate-200"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Discard Changes
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
