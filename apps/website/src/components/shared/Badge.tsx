import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "px-3 py-1.5",
    "text-sm font-medium",
    "rounded-full",
  ],
  {
    variants: {
      variant: {
        default: "bg-teal-50 text-teal-700",
        secondary: "bg-navy-50 text-navy-700",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        error: "bg-red-50 text-red-700",
        outline: "border border-gray-200 text-gray-700 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

/**
 * A badge/tag component for labels, categories, and status indicators.
 *
 * @example
 * ```tsx
 * <Badge>New</Badge>
 * <Badge variant="success">Free</Badge>
 * <Badge variant="warning">Premium</Badge>
 * ```
 */
export function Badge({ children, variant, className, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
