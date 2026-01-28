"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VideoBackgroundProps {
  /** Path to the video file */
  src?: string;
  /** Optional CSS class for the container */
  className?: string;
  /** Whether to show an overlay for better text contrast */
  overlay?: boolean;
  /** Overlay opacity (0-100) */
  overlayOpacity?: number;
}

/**
 * Reusable video background component with CSS gradient fallback.
 * Uses HTML5 video with autoPlay, muted, loop for seamless playback.
 */
export function VideoBackground({
  src = "/videos/gradient-bg.mp4",
  className,
  overlay = false,
  overlayOpacity = 30,
}: VideoBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Video element - hidden if failed to load */}
      {!videoFailed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* CSS gradient fallback when video fails or hasn't loaded yet */}
      <div
        className={cn(
          "absolute inset-0 gradient-bg",
          !videoFailed && "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* Optional overlay for text contrast */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
