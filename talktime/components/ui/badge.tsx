import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-primary/25 [a&]:hover:bg-primary/90 [a&]:hover:shadow-lg [a&]:hover:shadow-primary/30",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-secondary/25 [a&]:hover:bg-secondary/90 [a&]:hover:shadow-lg [a&]:hover:shadow-secondary/30",
        destructive:
          "border-transparent bg-destructive text-white shadow-destructive/25 [a&]:hover:bg-destructive/90 [a&]:hover:shadow-lg [a&]:hover:shadow-destructive/30 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground border-2 shadow-border/25 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:shadow-lg [a&]:hover:shadow-border/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
