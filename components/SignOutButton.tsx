"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignOutButtonProps extends ButtonProps {
    redirectUrl?: string
}

export function SignOutButton({ className, variant, children, redirectUrl = "/login", ...props }: SignOutButtonProps) {
    return (
        <Button
            onClick={() => signOut({ callbackUrl: redirectUrl })}
            variant={variant || "ghost"}
            className={cn("text-red-600 hover:text-red-700 hover:bg-red-50", className)}
            {...props}
        >
            <LogOut className="w-4 h-4 mr-2" />
            {children || "Sign Out"}
        </Button>
    )
}
