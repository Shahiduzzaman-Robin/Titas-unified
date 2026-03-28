"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignOutButtonProps extends ButtonProps {
    redirectUrl?: string
}

let isLoggingOut = false;

export function SignOutButton({ className, variant, children, redirectUrl = "/login", ...props }: SignOutButtonProps) {
    const handleSignOut = async () => {
        if (isLoggingOut) return
        isLoggingOut = true
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
            console.error('Logout log failed', e)
        }
        await signOut({ callbackUrl: redirectUrl })
    }

    return (
        <Button
            onClick={handleSignOut}
            variant={variant || "ghost"}
            className={cn("text-red-600 hover:text-red-700 hover:bg-red-50", className)}
            {...props}
        >
            <LogOut className="w-4 h-4 mr-2" />
            {children || "Sign Out"}
        </Button>
    )
}
