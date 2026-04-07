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
    variant?: 'default' | 'newsroom'
}

export default function SocialShare({ url, title, variant = 'default' }: SocialShareProps) {
    const [copied, setCopied] = useState(false)
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    const isNewsroom = variant === 'newsroom'
    const btnSize = isNewsroom ? "w-[48px] sm:w-[67px] h-[40px] sm:h-[45px]" : "h-9 w-9"
    const iconSize = isNewsroom ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4"
    const borderRadius = "rounded-[4px]"

    const shareLinks = [
        {
            name: 'Facebook',
            icon: <Facebook className={iconSize} />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: 'bg-[#3b5998] text-white'
        },
        {
            name: 'Twitter', // X
            icon: <div className="font-bold text-lg select-none">𝕏</div>,
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            color: 'bg-black text-white'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className={iconSize} />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: 'bg-[#0077b5] text-white'
        },
        {
            name: 'WhatsApp',
            icon: <MessageCircle className={iconSize} />,
            href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            color: 'bg-[#25d366] text-white'
        }
    ]

    const copyToClipboard = () => {
        try {
            // Use URL constructor to get a properly percent-encoded absolute URL
            // This ensures non-ASCII characters (like Bengali) are correctly encoded for social scrapers
            const encodedLink = new URL(url).toString();
            navigator.clipboard.writeText(encodedLink)
        } catch (e) {
            // Fallback to original url if URL constructor fails (e.g. relative path)
            navigator.clipboard.writeText(url)
        }
        setCopied(true)
        toast.success("Link copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`flex ${isNewsroom ? 'flex-nowrap' : 'flex-wrap'} gap-1`}>
            {shareLinks.map((link) => (
                <button
                    key={link.name}
                    className={`${btnSize} flex items-center justify-center ${borderRadius} ${link.color} hover:opacity-90 transition-opacity`}
                    onClick={() => window.open(link.href, '_blank')}
                    title={`Share on ${link.name}`}
                >
                    {link.icon}
                </button>
            ))}
            {isNewsroom && (
                <>
                    <button
                        className={`${btnSize} flex items-center justify-center ${borderRadius} bg-slate-500 text-white hover:opacity-90 transition-opacity`}
                        onClick={() => window.print()}
                        title="Print"
                    >
                        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 012-2H5a2 2 0 012 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                    <button
                        className={`${btnSize} flex items-center justify-center ${borderRadius} bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors`}
                        onClick={copyToClipboard}
                        title="Copy Link"
                    >
                        {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
                    </button>
                </>
            )}
            {!isNewsroom && (
                <button
                    className={`${btnSize} flex items-center justify-center ${borderRadius} bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors`}
                    onClick={copyToClipboard}
                    title="Copy Link"
                >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
            )}
        </div>
    )
}

