import { useTranslations, useLocale } from "next-intl"
import { prisma } from "@/lib/prisma"
import BlogEditor from "../_components/BlogEditor"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewBlogPostPage() {
    const categories = await prisma.blog_categories.findMany({
        orderBy: { name: 'asc' }
    })
    
    const tags = await prisma.blog_tags.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <Link href="/admin/blog">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100 text-slate-500 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Create New Story
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Draft your thoughts and share with the community</p>
                </div>
            </div>

            <BlogEditor 
                categories={categories}
                tags={tags}
            />
        </div>
    )
}
