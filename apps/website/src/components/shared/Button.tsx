import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-semibold",
    "rounded-full",
    "transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-teal-500 to-teal-600",
          "text-white",
          "shadow-button",
          "hover:shadow-button-hover hover:scale-[1.02]",
          "active:scale-[0.98]",
        ],
        secondary: [
          "bg-navy-900",
          "text-white",
          "shadow-md",
          "hover:bg-navy-800 hover:shadow-lg",
          "active:scale-[0.98]",
        ],
        outline: [
          "border-2 border-navy-900",
          "bg-transparent",
          "text-navy-900",
          "hover:bg-navy-900 hover:text-white",
        ],
        ghost: [
          "bg-transparent",
          "text-navy-900",
          "hover:bg-navy-50",
        ],
        link: [
          "bg-transparent",
          "text-teal-600",
          "underline-offset-4",
          "hover:underline",
          "p-0 h-auto",
        ],
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * A branded button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Get Started Free <ArrowRight className="ml-2" />
 * </Button>
 *
 * <Button variant="outline" href="/features">
 *   Learn More
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, href, loading, disabled, children, ...props },
    ref
  ) {
    const isDisabled = disabled || loading;

    const classes = cn(buttonVariants({ variant, size }), className);

    // Render as link if href is provided
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
