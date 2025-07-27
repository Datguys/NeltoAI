import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-105 active:scale-95 font-medium", // maps to primary
        primary: "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-105 active:scale-95 font-medium",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95 font-medium",
        secondary: "bg-secondary text-secondary-foreground hover:shadow-glow-secondary hover:scale-105 active:scale-95",
        neumorphic: "btn-neumorphic text-foreground font-medium",
        glass: "glass text-foreground hover:bg-glass-background/90 border-glass-border/30",
        outline: "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sidebar: "w-full justify-start bg-transparent text-muted-foreground hover:bg-card/30 hover:text-foreground transition-smooth",
        "sidebar-active": "w-full justify-start bg-gradient-primary text-primary-foreground glow-primary",
        upgrade: "bg-gradient-to-r from-warning to-accent text-foreground hover:scale-105 animate-glow-pulse",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-6 py-3",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
