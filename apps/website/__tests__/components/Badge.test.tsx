import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "@/components/shared/Badge";

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>New Feature</Badge>);
    expect(screen.getByText("New Feature")).toBeInTheDocument();
  });

  it("renders default variant with teal styling", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-teal-50");
    expect(badge).toHaveClass("text-teal-700");
  });

  it("renders secondary variant", () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>
    );
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-navy-50");
  });

  it("renders success variant", () => {
    render(
      <Badge variant="success" data-testid="badge">
        Success
      </Badge>
    );
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-emerald-50");
  });

  it("renders warning variant", () => {
    render(
      <Badge variant="warning" data-testid="badge">
        Warning
      </Badge>
    );
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-amber-50");
  });

  it("has pill shape", () => {
    render(<Badge data-testid="badge">Pill</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("rounded-full");
  });

  it("accepts custom className", () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Custom
      </Badge>
    );
    expect(screen.getByTestId("badge")).toHaveClass("custom-class");
  });

  it("renders with icon", () => {
    render(
      <Badge>
        <span data-testid="icon">🇵🇭</span> Filipino
      </Badge>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Filipino")).toBeInTheDocument();
  });
});
