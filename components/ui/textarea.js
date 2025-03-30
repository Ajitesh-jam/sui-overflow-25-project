"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div className="relative">
      <motion.textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className,
        )}
        ref={ref}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {isFocused && (
        <motion.span
          className="absolute inset-0 rounded-md pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.3)",
          }}
        />
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

