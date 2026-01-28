import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface PhoneMockupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animate?: boolean;
}

/**
 * A phone device mockup component for displaying app screenshots.
 *
 * @example
 * ```tsx
 * <PhoneMockup animate>
 *   <Image src="/screenshot.png" alt="App screenshot" fill />
 * </PhoneMockup>
 * ```
 */
export function PhoneMockup({
  children,
  animate = false,
  className,
  ...props
}: PhoneMockupProps) {
  return (
    <div
      className={cn(
        // Phone frame - iPhone 14/15 style proportions
        "relative",
        "w-[280px] md:w-[320px]",
        "aspect-[9/19.5]",
        "rounded-[48px]",
        "border-[10px] border-navy-900",
        "bg-navy-900",
        // Shadow
        "shadow-2xl shadow-navy-900/25",
        // Inner highlight
        "ring-1 ring-inset ring-white/10",
        // Animation
        animate && "animate-float",
        className
      )}
      {...props}
    >
      {/* Screen area - the Dynamic Island is rendered by the content */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-gray-50">
        {children}
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10">
        <div className="w-28 h-1 bg-gray-900/80 rounded-full" />
      </div>
    </div>
  );
}
