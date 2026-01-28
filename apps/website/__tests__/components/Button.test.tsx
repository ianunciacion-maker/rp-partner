import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/shared/Button";
import { ArrowRight } from "lucide-react";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders primary variant with teal gradient", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gradient-to-r");
    expect(button).toHaveClass("from-teal-500");
  });

  it("renders secondary variant with navy background", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-navy-900");
  });

  it("renders outline variant with border", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-2");
  });

  it("renders ghost variant with transparent background", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-transparent");
  });

  it("supports different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-14");
  });

  it("renders with icon", () => {
    render(
      <Button>
        Get Started <ArrowRight data-testid="icon" className="ml-2" />
      </Button>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as a link when href is provided", () => {
    render(<Button href="/signup">Sign Up</Button>);
    const link = screen.getByRole("link", { name: "Sign Up" });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("applies pill shape by default", () => {
    render(<Button>Pill Button</Button>);
    expect(screen.getByRole("button")).toHaveClass("rounded-full");
  });

  it("has proper focus styles for accessibility", () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("focus-visible:outline-none");
    expect(button).toHaveClass("focus-visible:ring-2");
  });
});
