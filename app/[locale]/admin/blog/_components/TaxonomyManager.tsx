"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { 
    Plus, 
    Edit3, 
    Trash2, 
    Loader2,
    FolderOpen,
    Tag,
    Hash,
    MoreVertical
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function CategoryManager() {
    const t = useTranslations('admin.blog')
    const tCommon = useTranslations('common')
    
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [name, setName] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/blog/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            toast.error("Failed to load categories")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!name) return
        setActionLoading(true)
        try {
            const url = editingCategory ? `/api/blog/categories/${editingCategory.id}` : '/api/blog/categories'
            const method = editingCategory ? 'PUT' : 'POST'
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                toast.success(editingCategory ? "Category updated" : "Category created")
                fetchCategories()
                handleClose()
            } else {
                const data = await res.json()
                toast.error(data.error || "Operation failed")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? This might affect posts in this category.")) return
        try {
            const res = await fetch(`/api/blog/categories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Category deleted")
                fetchCategories()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleEdit = (cat: any) => {
        setEditingCategory(cat)
        setName(cat.name)
        setIsDialogOpen(true)
    }

    const handleClose = () => {
        setIsDialogOpen(false)
        setEditingCategory(null)
        setName("")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-indigo-500" />
                    Categories ({categories.length})
                </h3>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsDialogOpen(true)} title="Add Category">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : categories.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-xl text-slate-400 font-medium">No categories found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat: any) => (
                        <div key={cat.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all group">
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate uppercase tracking-tight text-xs">{cat.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{cat.slug}</p>
                                <div className="mt-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                    {cat._count?.posts || 0} Stories
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => handleEdit(cat)}>
                                    <Edit3 size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(cat.id)}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                        <DialogDescription>Enter a name for the category. Slug will be generated automatically.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Category name (e.g. Campus News)"
                            className="font-bold uppercase tracking-tight"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={!name || actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingCategory ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function TagManager() {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<any>(null)
    const [name, setName] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/blog/tags')
            if (res.ok) {
                const data = await res.json()
                setTags(data)
            }
        } catch (error) {
            toast.error("Failed to load tags")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!name) return
        setActionLoading(true)
        try {
            const url = editingTag ? `/api/blog/tags/${editingTag.id}` : '/api/blog/tags'
            const method = editingTag ? 'PUT' : 'POST'
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                toast.success(editingTag ? "Tag updated" : "Tag created")
                fetchTags()
                handleClose()
            } else {
                const data = await res.json()
                toast.error(data.error || "Operation failed")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return
        try {
            const res = await fetch(`/api/blog/tags/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Tag deleted")
                fetchTags()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleEdit = (tag: any) => {
        setEditingTag(tag)
        setName(tag.name)
        setIsDialogOpen(true)
    }

    const handleClose = () => {
        setIsDialogOpen(false)
        setEditingTag(null)
        setName("")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-indigo-500" />
                    Tags ({tags.length})
                </h3>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : tags.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-xl text-slate-400 font-medium">No tags found</div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                        <div key={tag.id} className="group relative flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white border rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-indigo-300 transition-all shadow-sm">
                            <span className="text-indigo-400">#</span>
                            {tag.name}
                            <div className="flex h-5 items-center gap-0.5 ml-1 border-l pl-1">
                                <button className="hover:text-indigo-600 transition-colors" onClick={() => handleEdit(tag)}>
                                    <Edit3 size={10} />
                                </button>
                                <button className="hover:text-red-500 transition-colors" onClick={() => handleDelete(tag.id)}>
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTag ? "Edit Tag" : "Add Tag"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tag name (e.g. Photography)"
                            className="font-bold uppercase tracking-tight"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={!name || actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTag ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
