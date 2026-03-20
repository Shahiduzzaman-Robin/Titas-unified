'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { useTransition } from 'react'

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'bn' : 'en'

        // Construct new path
        const segments = pathname.split('/')
        if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'bn')) {
            segments[1] = newLocale
        } else {
            segments.splice(1, 0, newLocale)
        }
        const newPath = segments.join('/') || '/'

        // Store preference
        localStorage.setItem('preferredLocale', newLocale)
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

        startTransition(() => {
            router.push(newPath)
        })
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            disabled={isPending}
            className="gap-2"
        >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? 'বাং' : 'EN'}
        </Button>
    )
}
