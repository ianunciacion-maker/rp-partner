import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { type ElementType, type ComponentPropsWithoutRef } from "react";

const glassCardVariants = cva(
  [
    "backdrop-blur-xl",
    "border border-white/30",
    "rounded-3xl",
    "shadow-lg shadow-navy-900/10",
    "transition-all duration-300",
  ],
  {
    variants: {
      variant: {
        default: "bg-white/70",
        dark: "bg-white/85",
        colored: "bg-teal-500/10 border-teal-500/20",
      },
      hoverable: {
        true: "hover:-translate-y-1 hover:shadow-xl",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hoverable: false,
      padding: "none",
    },
  }
);

type GlassCardVariants = VariantProps<typeof glassCardVariants>;

type GlassCardProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & GlassCardVariants &
  Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * A glassmorphism-styled card component with frosted glass effect.
 *
 * @example
 * ```tsx
 * <GlassCard className="p-6">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </GlassCard>
 *
 * <GlassCard variant="dark" hoverable padding="lg">
 *   Interactive card with hover effect
 * </GlassCard>
 * ```
 */
export function GlassCard<T extends ElementType = "div">({
  as,
  className,
  children,
  variant,
  hoverable,
  padding,
  ...props
}: GlassCardProps<T>) {
  const Component = as || "div";

  return (
    <Component
      className={cn(glassCardVariants({ variant, hoverable, padding }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
