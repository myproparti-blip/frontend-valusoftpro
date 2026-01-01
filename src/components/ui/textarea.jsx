import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    const hasValue = props.value && props.value.toString().length > 0;
    
    return (
        <textarea
            className={cn(
                "flex min-h-[100px] w-full rounded-md border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm ring-offset-background placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:ring-offset-0 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm resize-vertical text-[#0F172A] hover:border-[#3B82F6]/50",
                !hasValue && "disabled:opacity-50 disabled:bg-[#F1F5F9]",
                hasValue && "disabled:opacity-100 disabled:bg-[#F1F5F9] disabled:border-[#CBD5E1]",
                className
            )}
            ref={ref}
            {...props}
        />
    );
})
Textarea.displayName = "Textarea"

export { Textarea }
