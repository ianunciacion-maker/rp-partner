import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Hero } from "@/components/sections/Hero";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: "div",
      span: "span",
      p: "p",
      h1: "h1",
      button: "button",
      a: "a",
    },
  };
});

describe("Hero", () => {
  it("renders the main headline", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /manage your rental properties like a pro/i })
    ).toBeInTheDocument();
  });

  it("renders the badge", () => {
    render(<Hero />);
    expect(screen.getByText(/built for filipino property owners/i)).toBeInTheDocument();
  });

  it("renders the subheadline", () => {
    render(<Hero />);
    expect(
      screen.getByText(/the all-in-one app/i)
    ).toBeInTheDocument();
  });

  it("renders primary CTA button", () => {
    render(<Hero />);
    expect(
      screen.getByRole("link", { name: /get started free/i })
    ).toBeInTheDocument();
  });

  it("renders secondary CTA button", () => {
    render(<Hero />);
    expect(
      screen.getByRole("link", { name: /see how it works/i })
    ).toBeInTheDocument();
  });

  it("renders trust indicators", () => {
    render(<Hero />);
    expect(screen.getByText(/4.8/i)).toBeInTheDocument();
    expect(screen.getByText(/10,000\+/i)).toBeInTheDocument();
  });

  it("renders phone mockup", () => {
    render(<Hero />);
    expect(screen.getByTestId("phone-mockup")).toBeInTheDocument();
  });

  it("has gradient background", () => {
    render(<Hero />);
    const section = screen.getByTestId("hero-section");
    expect(section).toHaveClass("gradient-bg");
  });

  it("has proper section semantics", () => {
    render(<Hero />);
    expect(screen.getByRole("region", { name: /hero/i })).toBeInTheDocument();
  });
});
