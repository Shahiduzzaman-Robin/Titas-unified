"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { 
    ImageIcon,
    Loader2,
    X,
    FolderOpen,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { PublicNav } from "@/components/PublicNav"
import Footer from "@/components/home/Footer"

const CATEGORIES = ["General", "Events", "Campus", "Activities"]

export default function PublicGalleryPage() {
    const t = useTranslations('nav')
    const tAdmin = useTranslations('admin.gallery')
    const tCommon = useTranslations('common')
    const locale = useLocale()

    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryFilter, setCategoryFilter] = useState("all")
    
    // Lightbox State
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    useEffect(() => {
        fetchImages()
    }, [categoryFilter])

    const fetchImages = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                category: categoryFilter,
                limit: '100'
            })
            const res = await fetch(`/api/gallery?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setImages(data)
            }
        } catch (error) {
            console.error("Failed to fetch gallery", error)
        } finally {
            setLoading(false)
        }
    }

    const nextImage = () => {
        if (selectedImageIndex === null) return
        setSelectedImageIndex((selectedImageIndex + 1) % images.length)
    }

    const prevImage = () => {
        if (selectedImageIndex === null) return
        setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PublicNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <Badge variant="outline" className="px-4 py-1 text-green-400 border-green-200 bg-green-50 font-bold uppercase tracking-widest text-xs">
                        {t('gallery')}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
                        Capturing <span className="text-green-400">Moments</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-500 font-medium">
                        Explore our campus, events, and student activities through these captured memories.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
                    <Button 
                        variant={categoryFilter === 'all' ? 'default' : 'outline'} 
                        className={cn("rounded-full px-6 h-10 font-bold uppercase tracking-wider text-xs", categoryFilter === 'all' ? "bg-green-400 shadow-green-200 shadow-lg" : "bg-white border-slate-200")}
                        onClick={() => setCategoryFilter('all')}
                    >
                        All
                    </Button>
                    {CATEGORIES.map(cat => (
                        <Button 
                            key={cat}
                            variant={categoryFilter === cat ? 'default' : 'outline'} 
                            className={cn("rounded-full px-6 h-10 font-bold uppercase tracking-wider text-xs", categoryFilter === cat ? "bg-green-400 shadow-green-200 shadow-lg" : "bg-white border-slate-200")}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {tAdmin(`categories.${cat.toLowerCase()}`)}
                        </Button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-2xl aspect-[4/3] relative flex items-center justify-center"
                                style={{ minHeight: 180 }}
                            >
                                <div
                                    className="absolute inset-0 bg-white/10 border border-white/20 backdrop-blur-lg shadow-xl rounded-2xl"
                                    style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
                                />
                                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                    <div
                                        className="lux-shimmer w-full h-full"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    />
                                </div>
                                <div className="relative z-10 flex flex-col items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-white/60 drop-shadow-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <ImageIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">{tAdmin('noPhotos')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {images.map((img: any, index: number) => (
                            <motion.div 
                                key={img.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group cursor-pointer"
                                onClick={() => setSelectedImageIndex(index)}
                            >
                                <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-white aspect-[4/3]">
                                    <div className="relative h-full w-full overflow-hidden">
                                        <img 
                                            src={img.url} 
                                            alt={img.title || ''} 
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                            <Badge className="w-fit mb-2 bg-green-400/90 text-white border-none backdrop-blur-md font-bold uppercase tracking-widest text-[10px]">
                                                {tAdmin(`categories.${img.category.toLowerCase()}`)}
                                            </Badge>
                                            <h3 className="text-white font-black uppercase tracking-tight truncate leading-tight">
                                                {img.title || 'Untitled Moment'}
                                            </h3>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                    >
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full h-12 w-12"
                            onClick={() => setSelectedImageIndex(null)}
                        >
                            <X className="h-8 w-8" />
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-16 w-16 hidden md:flex"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        >
                            <ChevronLeft className="h-10 w-10" />
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-16 w-16 hidden md:flex"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        >
                            <ChevronRight className="h-10 w-10" />
                        </Button>

                        <motion.div 
                            key={selectedImageIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative max-w-5xl w-full flex flex-col items-center"
                        >
                            <img 
                                src={images[selectedImageIndex].url} 
                                alt="" 
                                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
                            />
                            <div className="mt-8 text-center space-y-2">
                                <Badge className="bg-green-400 text-white border-none font-black uppercase tracking-widest px-4 py-1">
                                    {tAdmin(`categories.${images[selectedImageIndex].category.toLowerCase()}`)}
                                </Badge>
                                <h2 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">
                                    {images[selectedImageIndex].title || 'Untitled Moment'}
                                </h2>
                                <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
                                    {new Date(images[selectedImageIndex].createdAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Footer />
            {/* Glassmorphism shimmer effect styles */}
            <style jsx global>{`
                .lux-shimmer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.12) 100%);
                    filter: blur(2px);
                    opacity: 0.8;
                    animation: lux-shimmer-move 1.6s infinite linear;
                }
                @keyframes lux-shimmer-move {
                    0% {
                        transform: translateX(-60%) skewX(-12deg);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateX(20%) skewX(-12deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(100%) skewX(-12deg);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    )
}
