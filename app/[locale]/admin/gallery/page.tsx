"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { 
    Plus, 
    Search, 
    Filter, 
    Trash2, 
    Image as ImageIcon,
    Loader2,
    Upload,
    X,
    FolderOpen,
    User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CATEGORIES = ["General", "Events", "Campus", "Activities"]

export default function AdminGalleryPage() {
    const t = useTranslations('admin.gallery')
    const tCommon = useTranslations('common')
    const locale = useLocale()

    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryFilter, setCategoryFilter] = useState("all")
    
    // Upload State
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadData, setUploadData] = useState({
        title: "",
        category: "General"
    })

    // Delete State
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        fetchImages()
    }, [categoryFilter])

    const fetchImages = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                category: categoryFilter,
                limit: '50'
            })
            const res = await fetch(`/api/gallery?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setImages(data)
            }
        } catch (error) {
            console.error("Failed to fetch images", error)
            toast.error(tCommon('error'))
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return
        setUploadLoading(true)
        try {
            const formData = new FormData()
            formData.append('image', selectedFile)
            formData.append('title', uploadData.title)
            formData.append('category', uploadData.category)

            const res = await fetch('/api/gallery', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                toast.success(tCommon('success'))
                fetchImages()
                setIsUploadOpen(false)
                setSelectedFile(null)
                setPreviewUrl(null)
                setUploadData({ title: "", category: "General" })
            } else {
                const error = await res.json()
                toast.error(error.error || tCommon('error'))
            }
        } catch (error) {
            toast.error(tCommon('error'))
        } finally {
            setUploadLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/gallery/${deleteId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success(tCommon('success'))
                fetchImages()
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => setIsUploadOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('upload')}
                </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 overflow-y-hidden">
                <Button 
                    variant={categoryFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    className="rounded-full h-8"
                    onClick={() => setCategoryFilter('all')}
                >
                    All
                </Button>
                {CATEGORIES.map(cat => (
                    <Button 
                        key={cat}
                        variant={categoryFilter === cat ? 'default' : 'outline'} 
                        size="sm"
                        className="rounded-full h-8"
                        onClick={() => setCategoryFilter(cat)}
                    >
                        {t(`categories.${cat.toLowerCase()}`)}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-500 font-medium">{tCommon('loading')}</p>
                </div>
            ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">{t('noPhotos')}</p>
                    <Button variant="link" className="text-indigo-600" onClick={() => setIsUploadOpen(true)}>
                        {t('upload')}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((img: any) => (
                        <Card key={img.id} className="group overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                <img 
                                    src={img.url} 
                                    alt={img.title || ''} 
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full shadow-lg"
                                        onClick={() => setDeleteId(img.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <Badge className="bg-white/90 text-slate-800 hover:bg-white border-none shadow-sm backdrop-blur-sm">
                                        {t(`categories.${img.category.toLowerCase()}`)}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <h3 className="font-bold text-slate-900 truncate uppercase tracking-tight text-sm">
                                    {img.title || 'Untitled'}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                        <User className="h-3 w-3" />
                                        {img.uploadedBy?.name || 'Admin'}
                                    </div>
                                    <span className="text-[10px] text-slate-300">•</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {new Date(img.createdAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('upload')}</DialogTitle>
                        <DialogDescription>
                            Select an image and provide a title and category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Image</label>
                            {previewUrl ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                                    <button 
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-slate-900/50 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setPreviewUrl(null)
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                                    onClick={() => document.getElementById('gallery-upload-input')?.click()}
                                >
                                    <Upload className="h-8 w-8 text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                                    <p className="text-sm text-slate-500">Click to select image</p>
                                    <Input 
                                        id="gallery-upload-input"
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Title</label>
                            <Input 
                                placeholder="Image title (optional)" 
                                value={uploadData.title}
                                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(cat => (
                                    <Button
                                        key={cat}
                                        type="button"
                                        variant={uploadData.category === cat ? 'default' : 'outline'}
                                        size="sm"
                                        className="justify-start truncate"
                                        onClick={() => setUploadData({ ...uploadData, category: cat })}
                                    >
                                        <FolderOpen className={cn("h-3 w-3 mr-2", uploadData.category === cat ? "text-white" : "text-indigo-400")} />
                                        {t(`categories.${cat.toLowerCase()}`)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={uploadLoading}>
                            {tCommon('cancel')}
                        </Button>
                        <Button onClick={handleUpload} disabled={!selectedFile || uploadLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {uploadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('upload')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteConfirm')}</DialogTitle>
                        <DialogDescription>
                            This photo will be removed from the public gallery permanently.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
                            {tCommon('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                            {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {tCommon('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
