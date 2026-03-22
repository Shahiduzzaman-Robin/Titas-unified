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
        <div className="flex flex-wrap gap-1.5">
            {shareLinks.map((link) => (
                <button
                    key={link.name}
                    className={`h-9 w-9 flex items-center justify-center rounded-sm ${link.color} hover:opacity-90 transition-opacity`}
                    onClick={() => window.open(link.href, '_blank')}
                    title={`Share on ${link.name}`}
                >
                    {link.icon}
                </button>
            ))}
            <button
                className="h-9 w-9 flex items-center justify-center rounded-sm bg-[#4267B2] text-white hover:opacity-90 transition-opacity"
                onClick={() => window.open(`https://www.facebook.com/dialog/send?app_id=123456789&link=${encodedUrl}&redirect_uri=${encodedUrl}`, '_blank')}
                title="Messenger"
            >
                <MessageCircle className="h-4 w-4" />
            </button>
            <button
                className="h-9 w-9 flex items-center justify-center rounded-sm bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={copyToClipboard}
                title="Copy Link"
            >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
        </div>
    )
}

