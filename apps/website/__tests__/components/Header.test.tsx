import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getByText("RP-Partner")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /features/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pricing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /get started free/i })).toBeInTheDocument();
  });

  it("renders mobile menu button on small screens", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("toggles mobile menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: /open menu/i });
    await user.click(menuButton);

    // Mobile nav should now be visible
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });

  it("has proper navigation accessibility", () => {
    render(<Header />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("logo links to home", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: /rp-partner/i });
    expect(logo).toHaveAttribute("href", "/");
  });
});
