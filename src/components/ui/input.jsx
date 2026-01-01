import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    const hasValue = props.value && props.value.toString().length > 0;
    
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm ring-offset-background placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 font-medium transition-all duration-200 shadow-sm text-[#0F172A] hover:border-[#3B82F6]/50",
                !hasValue && "disabled:opacity-50 disabled:bg-[#F1F5F9]",
                hasValue && "disabled:opacity-100 disabled:bg-[#F1F5F9] disabled:border-[#CBD5E1]",
                className
            )}
            ref={ref}
            {...props}
        />
    );
})
Input.displayName = "Input"

export { Input }
