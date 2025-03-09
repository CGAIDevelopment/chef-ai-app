import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const logoVariants = cva("inline-flex items-center justify-center gap-2 rounded-md bg-background p-2 text-foreground", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export default function Logo({ size, className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <div className={cn(logoVariants({ size }), className)}>
      {/* Your logo content here */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor" />
      </svg>
    </div>
  )
}

