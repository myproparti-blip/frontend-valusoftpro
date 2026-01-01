import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border border-[#E2E8F0] bg-white text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[#3B82F6] hover:-translate-y-0.5",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 border-b border-[#E2E8F0] px-6 py-5 bg-[#F8FAFC]", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-xl font-bold leading-tight tracking-tight text-[#0F172A]",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-[#475569] font-medium", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-5", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
