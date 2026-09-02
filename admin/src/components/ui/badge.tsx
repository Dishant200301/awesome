import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-black leading-tight shrink-0"
  
  const variantStyles = {
    default: "border-transparent bg-neutral-900 text-white shadow-2xs",
    secondary: "border-neutral-200 bg-neutral-100 text-neutral-800",
    destructive: "border-transparent bg-rose-600 text-white shadow-2xs",
    outline: "text-neutral-800 border-neutral-200 bg-white",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props} />
  )
}

export { Badge }
