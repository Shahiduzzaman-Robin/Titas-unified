"use client"

import { 
    Facebook, 
    Twitch, 
    Linkedin, 
    MessageCircle, 
    Share2, 
    Copy,
    Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface SocialShareProps {
    url: string
    title: string
}

export default function SocialShare({ url, title }: SocialShareProps) {
    const [copied, setCopied] = useState(false)
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    const shareLinks = [
        {
            name: 'Facebook',
            icon: <Facebook className="h-4 w-4" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: 'bg-[#1877F2] text-white'
        },
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="h-4 w-4" />,
            href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            color: 'bg-[#25D366] text-white'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="h-4 w-4" />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: 'bg-[#0A66C2] text-white'
        }
    ]

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Link copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Share Story</h4>
            <div className="flex flex-wrap gap-2">
                {shareLinks.map((link) => (
                    <Button
                        key={link.name}
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-full ${link.color} shadow-lg shadow-indigo-100 hover:scale-110 transition-transform`}
                        onClick={() => window.open(link.href, '_blank')}
                        title={`Share on ${link.name}`}
                    >
                        {link.icon}
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-600 shadow-lg shadow-indigo-100 hover:scale-110 transition-transform"
                    onClick={copyToClipboard}
                    title="Copy Link"
                >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
