import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-[#3B82F6] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8] shadow-sm hover:shadow-md",
                destructive:
                    "bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-sm hover:shadow-md",
                outline:
                    "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#3B82F6] active:bg-[#F1F5F9] shadow-sm hover:shadow-md",
                secondary:
                    "bg-[#6366F1] text-white hover:bg-[#4F46E5] active:bg-[#4338CA] shadow-sm hover:shadow-md",
                ghost: "hover:bg-[#F1F5F9] text-[#0F172A] hover:text-[#3B82F6] transition-colors",
                link: "text-[#3B82F6] underline-offset-4 hover:underline hover:text-[#2563EB]",
                success: "bg-[#10B981] text-white hover:bg-[#059669] active:bg-[#047857] shadow-sm hover:shadow-md",
                muted: "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#CBD5E1] shadow-sm hover:shadow-md",
                warning: "bg-[#F59E0B] text-white hover:bg-[#D97706] active:bg-[#B45309] shadow-sm hover:shadow-md",
                info: "bg-[#0EA5E9] text-white hover:bg-[#0284C7] active:bg-[#0369A1] shadow-sm hover:shadow-md",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3 text-xs rounded-md",
                lg: "h-12 px-8 text-base font-bold",
                icon: "h-10 w-10 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
