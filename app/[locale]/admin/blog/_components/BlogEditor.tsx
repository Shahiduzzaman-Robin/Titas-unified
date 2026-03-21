"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import ImageCropper from "@/components/registration/ImageCropper"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import("react-quill-new")
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />
}, {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-50 flex items-center justify-center border rounded-md"><Loader2 className="animate-spin text-slate-300" /></div>
})

import "react-quill-new/dist/quill.snow.css"
import { useRef } from "react"

// Add custom styles for blog content images
const editorStyles = `
  .blog-content img {
    width: 30% !important;
    height: auto !important;
    border-radius: 1rem;
    margin: 1rem 0;
  }
  .ql-editor img {
    max-width: 30%;
    height: auto;
    cursor: default;
  }
`

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
    const [authorName, setAuthorName] = useState(initialData?.authorName || "")
    const [content, setContent] = useState(initialData?.content || "")
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
    const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() || "")
    const [status, setStatus] = useState(initialData?.status || "draft")
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
        initialData?.tags?.map((t: any) => t.id) || []
    )
    
    const [featuredImage, setFeaturedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.featuredImage || null)
    const [cropImageStr, setCropImageStr] = useState<string | null>(null)
    const quillRef = useRef<any>(null)

    const imageHandler = useCallback(() => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            const file = input.files?.[0]
            if (file) {
                const formData = new FormData()
                formData.append('file', file)

                const loadingToast = toast.loading("Uploading image...")
                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })
                    const data = await res.json()

                    if (res.ok) {
                        const quill = quillRef.current.getEditor()
                        const range = quill.getSelection()
                        quill.insertEmbed(range.index, 'image', data.imagePath)
                        toast.success("Image uploaded", { id: loadingToast })
                    } else {
                        toast.error(data.error || "Upload failed", { id: loadingToast })
                    }
                } catch (error) {
                    toast.error("Upload failed", { id: loadingToast })
                }
            }
        }
    }, [])

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setCropImageStr(reader.result as string)
            }
            reader.readAsDataURL(file)
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
            formData.append('authorName', authorName)
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
            {cropImageStr && (
                <ImageCropper
                    image={cropImageStr}
                    aspect={1.91}
                    onCropComplete={async (croppedBlob) => {
                        const croppedFile = new File([croppedBlob], "featured-image.jpg", { type: "image/jpeg" })
                        setFeaturedImage(croppedFile)
                        setPreviewUrl(URL.createObjectURL(croppedBlob))
                        setCropImageStr(null)
                    }}
                    onCancel={() => {
                        setCropImageStr(null)
                        const input = document.getElementById('image-upload') as HTMLInputElement
                        if (input) input.value = ''
                    }}
                />
            )}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main content */}
                <div className="flex-1 space-y-6">
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                        <CardHeader className="pt-6 pb-2 px-6">
                            <CardTitle className="text-base font-bold flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Type className="h-4 w-4" />
                                </div>
                                Content Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-7">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1 flex items-center gap-2">
                                    Post Title <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a compelling title..."
                                    className="text-lg font-medium h-12 bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all rounded-xl"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1 flex items-center gap-2">
                                    Author Name (Optional)
                                </label>
                                <Input 
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Leave blank to display as Titas Editorial Team..."
                                    className="text-sm font-medium h-12 bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1 flex items-center gap-2">
                                    Post Content <span className="text-red-500">*</span>
                                </label>
                                <div className="prose prose-slate max-w-none pb-12">
                                    <style>{editorStyles}</style>
                                    <ReactQuill 
                                        forwardedRef={quillRef}
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        className="h-[400px] mb-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1 flex items-center gap-2">
                                    Excerpt (Short Summary)
                                </label>
                                <Textarea 
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Brief summary for list views..."
                                    className="h-24 resize-none bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all rounded-xl"
                                />
                                <p className="text-[10px] text-slate-400 font-medium pl-1">Leave empty to auto-generate from content.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-96 space-y-6">
                    {/* Status & Category */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                        <CardHeader className="pt-6 pb-2 px-6">
                            <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-widest text-slate-700">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FolderOpen className="h-4 w-4" />
                                </div>
                                Publishing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase pl-1">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-slate-50 border-transparent hover:border-slate-200 focus:ring-2 focus:ring-indigo-100/50 focus:border-indigo-400 transition-all rounded-xl h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft" className="font-medium rounded-lg">Draft</SelectItem>
                                        <SelectItem value="published" className="font-medium rounded-lg">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase pl-1">Category <span className="text-red-500">*</span></label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="bg-slate-50 border-transparent hover:border-slate-200 focus:ring-2 focus:ring-indigo-100/50 focus:border-indigo-400 transition-all rounded-xl h-11">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat: any) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()} className="font-medium rounded-lg">{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                        <CardHeader className="pt-6 pb-2 px-6">
                            <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-widest text-slate-700">
                                <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <ImageIcon className="h-4 w-4" />
                                </div>
                                Featured Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {previewUrl ? (
                                <div className="space-y-4">
                                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <button 
                                            type="button"
                                            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
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
                                        className="w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 border-slate-200 hover:bg-slate-50"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                    >
                                        Change Image
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    className="aspect-[16/9] rounded-xl border-2 border-dashed border-indigo-200/60 flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <p className="text-xs font-bold text-indigo-900/60 uppercase tracking-widest">Upload Header Image</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Recommended: 1200x630 (1.91:1)</p>
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
                    <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                        <CardHeader className="pt-6 pb-2 px-6">
                            <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-widest text-slate-700">
                                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <Tag className="h-4 w-4" />
                                </div>
                                Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {tags.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No tags available</p>
                                ) : (
                                    tags.map((tag: any) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border",
                                                selectedTagIds.includes(tag.id)
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                                    : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                                            )}
                                        >
                                            {selectedTagIds.includes(tag.id) && <Check className="w-3 h-3" />}
                                            {tag.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sticky bottom-6 bg-slate-50/50 p-4 -mx-4 rounded-2xl backdrop-blur border border-slate-100 lg:bg-transparent lg:p-0 lg:mx-0 lg:border-none lg:backdrop-filter-none">
                        <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14 text-sm font-bold uppercase tracking-wider shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] rounded-xl"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            {isEditing ? "Update Post" : "Publish Post"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="h-12 text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-slate-50 rounded-xl"
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
