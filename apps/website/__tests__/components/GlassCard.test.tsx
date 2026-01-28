import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GlassCard } from "@/components/shared/GlassCard";

describe("GlassCard", () => {
  it("renders children correctly", () => {
    render(<GlassCard>Card Content</GlassCard>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("applies glassmorphism styles", () => {
    render(<GlassCard data-testid="glass-card">Content</GlassCard>);
    const card = screen.getByTestId("glass-card");
    expect(card).toHaveClass("backdrop-blur-xl");
    expect(card).toHaveClass("bg-white/70");
  });

  it("accepts custom className", () => {
    render(
      <GlassCard className="custom-class" data-testid="glass-card">
        Content
      </GlassCard>
    );
    const card = screen.getByTestId("glass-card");
    expect(card).toHaveClass("custom-class");
  });

  it("supports different variants", () => {
    const { rerender } = render(
      <GlassCard variant="default" data-testid="glass-card">
        Content
      </GlassCard>
    );
    expect(screen.getByTestId("glass-card")).toHaveClass("bg-white/70");

    rerender(
      <GlassCard variant="dark" data-testid="glass-card">
        Content
      </GlassCard>
    );
    expect(screen.getByTestId("glass-card")).toHaveClass("bg-white/85");
  });

  it("applies hover styles when hoverable", () => {
    render(
      <GlassCard hoverable data-testid="glass-card">
        Content
      </GlassCard>
    );
    const card = screen.getByTestId("glass-card");
    expect(card).toHaveClass("hover:-translate-y-1");
  });

  it("renders as different HTML elements via as prop", () => {
    render(
      <GlassCard as="section" data-testid="glass-card">
        Content
      </GlassCard>
    );
    const card = screen.getByTestId("glass-card");
    expect(card.tagName).toBe("SECTION");
  });

  it("forwards additional props", () => {
    render(
      <GlassCard data-testid="glass-card" aria-label="Glass card">
        Content
      </GlassCard>
    );
    const card = screen.getByTestId("glass-card");
    expect(card).toHaveAttribute("aria-label", "Glass card");
  });
});
