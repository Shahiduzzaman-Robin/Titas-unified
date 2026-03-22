"use client"

import { useState, useEffect } from "react"
import { 
    Search, 
    CheckCircle2, 
    XCircle, 
    Trash2, 
    Loader2, 
    MessageSquare,
    MoreVertical,
    Check,
    X,
    Eye,
    AlertTriangle,
    Flag
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
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CommentWithPost {
    id: number;
    name: string;
    email?: string;
    text: string;
    likes: number;
    approved: boolean;
    flagged: boolean;
    flagReason?: string;
    createdAt: string;
    post: {
        title: string;
        slug: string;
    }
}

export function CommentManager() {
    const [comments, setComments] = useState<CommentWithPost[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all") // all, pending, approved, flagged

    useEffect(() => {
        fetchComments()
    }, [statusFilter])

    const fetchComments = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/blog/comments?status=${statusFilter}`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error("Failed to fetch comments", error)
            toast.error("Failed to fetch comments")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (id: number, data: any) => {
        try {
            const res = await fetch(`/api/blog/comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                toast.success("Comment updated")
                setComments(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
            }
        } catch (error) {
            toast.error("Failed to update comment")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this comment permanently?")) return
        
        try {
            const res = await fetch(`/api/blog/comments/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success("Comment deleted")
                setComments(prev => prev.filter(c => c.id !== id))
            }
        } catch (error) {
            toast.error("Failed to delete comment")
        }
    }

    const filteredComments = comments.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.text.toLowerCase().includes(search.toLowerCase()) ||
        c.post.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search comments, authors or posts..." 
                        className="pl-11 h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'pending', 'approved', 'flagged'].map((s) => (
                        <Button 
                            key={s}
                            variant={statusFilter === s ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "rounded-full px-4 h-9 font-bold uppercase tracking-widest text-[10px]",
                                statusFilter === s ? "bg-slate-900 text-white" : "bg-white text-slate-500"
                            )}
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Author & Post</TableHead>
                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Comment Content</TableHead>
                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                            <TableHead className="px-6 py-4 text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-300 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredComments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <MessageSquare size={32} />
                                        <p className="font-medium">No comments found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredComments.map((comment) => (
                                <TableRow key={comment.id} className="hover:bg-slate-50/50 group border-slate-100 transition-colors">
                                    <TableCell className="px-6 py-4 align-top w-[250px]">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                                {comment.name}
                                                {comment.email && <span className="text-[10px] text-slate-400 font-normal">({comment.email})</span>}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Eye size={12} className="text-slate-400" />
                                                on 
                                                <Link 
                                                    href={`/admin/blog/${comment.post.slug}`}
                                                    className="font-bold text-indigo-600 hover:underline"
                                                >
                                                    {comment.post.title.slice(0, 30)}...
                                                </Link>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                                                {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-top">
                                        <div className="relative">
                                            <p className="text-sm text-slate-600 leading-relaxed italic pr-4">
                                                "{comment.text}"
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase rounded-sm px-2 py-0.5 border-slate-200 text-slate-400">
                                                    {comment.likes} LIKES
                                                </Badge>
                                                {comment.flagged && (
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none text-[9px] font-black uppercase rounded-sm px-2 py-0.5">
                                                        FLAGGED: {comment.flagReason || 'Policy Violation'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center align-top">
                                        <Badge className={cn(
                                            "text-[10px] font-black uppercase border-none px-3 py-1 rounded-full",
                                            comment.approved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {comment.approved ? 'Approved' : 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right align-top">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                                                {!comment.approved ? (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdate(comment.id, { approved: true })}
                                                        className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 font-bold uppercase tracking-widest text-[10px] rounded-lg"
                                                    >
                                                        <Check className="mr-2 h-3.5 w-3.5" /> Approve
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdate(comment.id, { approved: false })}
                                                        className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 font-bold uppercase tracking-widest text-[10px] rounded-lg"
                                                    >
                                                        <X className="mr-2 h-3.5 w-3.5" /> Reject / Hide
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {!comment.flagged ? (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdate(comment.id, { flagged: true, flagReason: 'Spam' })}
                                                        className="text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-lg"
                                                    >
                                                        <Flag className="mr-2 h-3.5 w-3.5" /> Mark as Flagged
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdate(comment.id, { flagged: false })}
                                                        className="text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-lg"
                                                    >
                                                        <XCircle className="mr-2 h-3.5 w-3.5" /> Clear Flag
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 font-bold uppercase tracking-widest text-[10px] rounded-lg"
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
        </div>
    )
}
