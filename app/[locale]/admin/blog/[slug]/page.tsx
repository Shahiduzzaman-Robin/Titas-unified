import { useTranslations, useLocale } from "next-intl"
import { prisma } from "@/lib/prisma"
import BlogEditor from "../_components/BlogEditor"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditBlogPostPage({ params }: { params: { slug: string } }) {
    const { slug } = params

    const [post, categories, tags] = await Promise.all([
        prisma.blog_posts.findUnique({
            where: { slug },
            include: {
                category: true,
                tags: true
            }
        }),
        prisma.blog_categories.findMany({
            orderBy: { name: 'asc' }
        }),
        prisma.blog_tags.findMany({
            orderBy: { name: 'asc' }
        })
    ])

    if (!post) {
        notFound()
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/blog">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-white text-slate-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-l-4 border-amber-500 pl-4 uppercase">
                        Edit Story
                    </h1>
                    <p className="text-sm text-slate-500 font-medium pl-4">Refine your content and keep your audience engaged</p>
                </div>
            </div>

            <BlogEditor 
                initialData={post}
                categories={categories}
                tags={tags}
                isEditing={true}
            />
        </div>
    )
}
