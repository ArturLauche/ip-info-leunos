import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        outline: "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/15 [a&]:hover:bg-destructive/20",
        success:
          "border-success/30 bg-success/10 text-success dark:bg-success/15 [a&]:hover:bg-success/20",
        warning:
          "border-warning/30 bg-warning/10 text-warning dark:bg-warning/15 [a&]:hover:bg-warning/20",
        info: "border-info/30 bg-info/10 text-info dark:bg-info/15 [a&]:hover:bg-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
