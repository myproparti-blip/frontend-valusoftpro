import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-xs font-semibold leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0F172A] uppercase tracking-wider"
)

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
