"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { cn } from "@/lib/utils"
import { Menu, X, User, LogOut } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"

interface PublicNavProps {
    session?: {
        user: {
            name?: string | null
            email?: string | null
            role?: string
        }
    } | null
}

export function PublicNav({ session: serverSession }: PublicNavProps) {
    const tPublic = useTranslations('public')
    const tNav = useTranslations('nav')
    const pathname = usePathname()
    const locale = useLocale()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Use client-side session if server session is not provided
    const { data: clientSession } = useSession()
    const session = serverSession || clientSession

    const navItems = [
        { name: tNav('home'), href: `/${locale}` },
        { name: tNav('about'), href: `/${locale}/about` },
        { name: tNav('students'), href: `/${locale}/students` },
        { name: tNav('blog'), href: `/${locale}/blog` },
        { name: tNav('gallery'), href: `/${locale}/gallery` },
        { name: tNav('contact'), href: `/${locale}/contact` },
        { name: tNav('register'), href: `/${locale}/register` },
    ]

    const isActive = (path: string) => {
        // For home page, check exact match or just locale
        if (path === `/${locale}`) {
            return pathname === `/${locale}` || pathname === `/${locale}/`
        }
        // For other pages, check if pathname starts with the path
        return pathname?.startsWith(path)
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: `/${locale}/login` })
    }

    return (
        <header className="bg-white border-b sticky top-0 z-50 bn-text">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo & Title */}
                    <Link href="/" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity">
                        <Image 
                            src="https://res.cloudinary.com/dwybib7hh/image/upload/v1774173529/titas/brand/logo.png" 
                            alt="Logo" 
                            width={56} 
                            height={56} 
                            className="object-contain" 
                            priority
                        />
                        <div>
                            <h1 className="text-xl md:text-2xl font-normal text-primary leading-tight">{tPublic('title')}</h1>
                            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">{tPublic('subtitle')}</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <nav className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap block",
                                        isActive(item.href)
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                    )}>
                                        {item.name}
                                    </span>
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                            <LanguageSwitcher />
                            {session ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <User className="h-4 w-4" />
                                            <span className="hidden lg:inline">{session.user.name}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/${locale}/student/profile`} className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>{tNav('myAccount')}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>{tNav('logout')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/login">
                                    <Button variant="outline" size="sm" className="hidden lg:flex">{tNav('login')}</Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={cn(
                                        "px-4 py-3 rounded-md text-base font-medium block transition-colors",
                                        isActive(item.href)
                                            ? "bg-primary/5 text-primary"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}>
                                        {item.name}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                        <div className="pt-4 border-t border-gray-100">
                            {session ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2 bg-gray-50 rounded-md">
                                        <p className="text-sm font-medium">{session.user.name}</p>
                                        <p className="text-xs text-gray-500">{session.user.email}</p>
                                    </div>
                                    <Link href={`/${locale}/student/profile`} onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full justify-center" variant="outline">
                                            <User className="mr-2 h-4 w-4" />
                                            {tNav('myAccount')}
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handleSignOut}
                                        className="w-full justify-center"
                                        variant="outline"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {tNav('logout')}
                                    </Button>
                                </div>
                            ) : (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full justify-center" variant="outline">{tNav('login')}</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
