import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhoneMockup } from "@/components/shared/PhoneMockup";

describe("PhoneMockup", () => {
  it("renders the phone frame", () => {
    render(<PhoneMockup data-testid="phone">Content</PhoneMockup>);
    expect(screen.getByTestId("phone")).toBeInTheDocument();
  });

  it("renders children inside the screen area", () => {
    render(<PhoneMockup>App Screenshot</PhoneMockup>);
    expect(screen.getByText("App Screenshot")).toBeInTheDocument();
  });

  it("applies phone frame styling", () => {
    render(<PhoneMockup data-testid="phone">Content</PhoneMockup>);
    const phone = screen.getByTestId("phone");
    expect(phone).toHaveClass("rounded-[44px]");
  });

  it("accepts custom className", () => {
    render(
      <PhoneMockup className="custom-class" data-testid="phone">
        Content
      </PhoneMockup>
    );
    expect(screen.getByTestId("phone")).toHaveClass("custom-class");
  });

  it("supports float animation", () => {
    render(
      <PhoneMockup animate data-testid="phone">
        Content
      </PhoneMockup>
    );
    expect(screen.getByTestId("phone")).toHaveClass("animate-float");
  });

  it("renders with proper aspect ratio", () => {
    render(<PhoneMockup data-testid="phone">Content</PhoneMockup>);
    const phone = screen.getByTestId("phone");
    expect(phone).toHaveClass("aspect-[9/19]");
  });
});
