import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  useInView: () => true,
  useAnimation: () => ({
    start: vi.fn(),
  }),
}));

describe("ScrollReveal", () => {
  it("renders children", () => {
    render(<ScrollReveal>Content to reveal</ScrollReveal>);
    expect(screen.getByText("Content to reveal")).toBeInTheDocument();
  });

  it("wraps content in motion div", () => {
    render(<ScrollReveal>Animated content</ScrollReveal>);
    expect(screen.getByTestId("motion-div")).toBeInTheDocument();
  });

  it("accepts custom className", () => {
    render(<ScrollReveal className="custom-class">Content</ScrollReveal>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("supports different animation directions", () => {
    const { rerender } = render(
      <ScrollReveal direction="up">Up</ScrollReveal>
    );
    expect(screen.getByText("Up")).toBeInTheDocument();

    rerender(<ScrollReveal direction="down">Down</ScrollReveal>);
    expect(screen.getByText("Down")).toBeInTheDocument();

    rerender(<ScrollReveal direction="left">Left</ScrollReveal>);
    expect(screen.getByText("Left")).toBeInTheDocument();

    rerender(<ScrollReveal direction="right">Right</ScrollReveal>);
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("supports custom delay", () => {
    render(<ScrollReveal delay={0.5}>Delayed</ScrollReveal>);
    expect(screen.getByText("Delayed")).toBeInTheDocument();
  });

  it("supports once prop for single animation", () => {
    render(<ScrollReveal once>Once only</ScrollReveal>);
    expect(screen.getByText("Once only")).toBeInTheDocument();
  });
});
