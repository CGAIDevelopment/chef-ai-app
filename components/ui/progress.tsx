import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number
    max?: number
  }
>(({ className, value, max = 100, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-in-out"
        style={{
          transform: `translateX(-${100 - (value / max) * 100}%)`,
        }}
      />
    </div>
  )
})

Progress.displayName = "Progress"

export { Progress } 