import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: number
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0:
                return { label: "অপেক্ষমাণ", variant: "warning" as const }
            case 1:
                return { label: "অনুমোদিত", variant: "success" as const }
            case 2:
                return { label: "প্রত্যাখ্যাত", variant: "destructive" as const }
            default:
                return { label: "অজানা", variant: "outline" as const }
        }
    }

    const { label, variant } = getStatusInfo(status)

    const variantClasses = {
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        success: "bg-green-500 text-white hover:bg-green-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border-gray-300 text-gray-700"
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variantClasses[variant],
                className
            )}
        >
            {label}
        </span>
    )
}
