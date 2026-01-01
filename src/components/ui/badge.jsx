import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 uppercase tracking-wide shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-sm",
        secondary:
          "border-transparent bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-sm",
        destructive:
          "border-transparent bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm",
        outline: "text-[#1E40AF] border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE]",
        success: "border-transparent bg-[#10B981] text-white hover:bg-[#059669] shadow-sm",
        warning: "border-transparent bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-sm",
        info: "border-transparent bg-[#0EA5E9] text-white hover:bg-[#0284C7] shadow-sm",
        muted: "border-transparent bg-[#E2E8F0] text-[#0F172A] hover:bg-[#CBD5E1]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
