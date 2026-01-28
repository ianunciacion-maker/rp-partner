import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

/**
 * Luxurious ambient glow background for Hero and FinalCTA sections.
 * Deep navy base with slow-moving, soft light accents.
 *
 * Design: Subtle & Sophisticated - premium real estate aesthetic
 * Duration: 20 seconds at 30fps (600 frames)
 * Animation: Barely perceptible floating + breathing effect
 */
export const GradientBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow, smooth progress for the entire loop (0 to 1)
  const loopProgress = frame / durationInFrames;

  // Orb 1: Large teal glow, top-right area, slow drift
  const orb1X = interpolate(
    Math.sin(loopProgress * Math.PI * 2),
    [-1, 1],
    [55, 75]
  );
  const orb1Y = interpolate(
    Math.cos(loopProgress * Math.PI * 2),
    [-1, 1],
    [15, 35]
  );
  const orb1Scale = interpolate(
    Math.sin(loopProgress * Math.PI * 4), // Breathe twice per loop
    [-1, 1],
    [0.9, 1.1]
  );
  const orb1Opacity = interpolate(
    Math.sin(loopProgress * Math.PI * 4),
    [-1, 1],
    [0.08, 0.15]
  );

  // Orb 2: Subtle white/cyan glow, bottom-left, counter-drift
  const orb2X = interpolate(
    Math.sin(loopProgress * Math.PI * 2 + Math.PI), // Offset phase
    [-1, 1],
    [10, 30]
  );
  const orb2Y = interpolate(
    Math.cos(loopProgress * Math.PI * 2 + Math.PI),
    [-1, 1],
    [60, 80]
  );
  const orb2Scale = interpolate(
    Math.sin(loopProgress * Math.PI * 4 + Math.PI / 2),
    [-1, 1],
    [0.85, 1.05]
  );
  const orb2Opacity = interpolate(
    Math.sin(loopProgress * Math.PI * 4 + Math.PI / 2),
    [-1, 1],
    [0.06, 0.12]
  );

  // Orb 3: Very subtle accent, center-left, slowest movement
  const orb3X = interpolate(
    Math.sin(loopProgress * Math.PI * 2 + Math.PI / 3),
    [-1, 1],
    [25, 40]
  );
  const orb3Y = interpolate(
    Math.cos(loopProgress * Math.PI * 2 + Math.PI / 3),
    [-1, 1],
    [30, 50]
  );
  const orb3Opacity = interpolate(
    Math.sin(loopProgress * Math.PI * 2),
    [-1, 1],
    [0.04, 0.08]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a1628", // Deep, rich navy
      }}
    >
      {/* Subtle base gradient for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(30, 70, 120, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Orb 1: Primary teal glow */}
      <div
        style={{
          position: "absolute",
          left: `${orb1X}%`,
          top: `${orb1Y}%`,
          width: "60%",
          height: "60%",
          transform: `translate(-50%, -50%) scale(${orb1Scale})`,
          background:
            "radial-gradient(circle, rgba(56, 178, 172, 0.6) 0%, rgba(56, 178, 172, 0) 70%)",
          filter: "blur(80px)",
          opacity: orb1Opacity,
        }}
      />

      {/* Orb 2: Secondary cool glow */}
      <div
        style={{
          position: "absolute",
          left: `${orb2X}%`,
          top: `${orb2Y}%`,
          width: "50%",
          height: "50%",
          transform: `translate(-50%, -50%) scale(${orb2Scale})`,
          background:
            "radial-gradient(circle, rgba(100, 180, 220, 0.5) 0%, rgba(100, 180, 220, 0) 70%)",
          filter: "blur(100px)",
          opacity: orb2Opacity,
        }}
      />

      {/* Orb 3: Tertiary subtle accent */}
      <div
        style={{
          position: "absolute",
          left: `${orb3X}%`,
          top: `${orb3Y}%`,
          width: "45%",
          height: "45%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(56, 178, 172, 0.4) 0%, rgba(56, 178, 172, 0) 60%)",
          filter: "blur(120px)",
          opacity: orb3Opacity,
        }}
      />

      {/* Subtle top vignette for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(5, 10, 20, 0.4) 0%, transparent 30%)",
        }}
      />
    </AbsoluteFill>
  );
};
