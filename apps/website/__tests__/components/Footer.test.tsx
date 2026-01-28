import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders the logo", () => {
    render(<Footer />);
    expect(screen.getByText("RP-Partner")).toBeInTheDocument();
  });

  it("renders product links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /features/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pricing/i })).toBeInTheDocument();
  });

  it("renders company links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });

  it("renders legal links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms/i })).toBeInTheDocument();
  });

  it("renders app store badges", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /app store/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /play store/i })).toBeInTheDocument();
  });

  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 RP-Partner/i)).toBeInTheDocument();
  });

  it("renders Made in Philippines text", () => {
    render(<Footer />);
    expect(screen.getByText(/Philippines/i)).toBeInTheDocument();
  });

  it("has proper footer semantics", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
