import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategoryDetailsToggle } from "./CategoryDetailsToggle";

describe("CategoryDetailsToggle", () => {
  const defaultProps = {
    toggleOpen: vi.fn(),
    open: false,
    currentMonthName: "January",
    hasSelectedCategories: false,
    available: 1500.5,
  };

  describe("Button Label", () => {
    it("should display month balance when no categories are selected", () => {
      render(<CategoryDetailsToggle {...defaultProps} />);

      expect(screen.getByText("January's Balance")).toBeInTheDocument();
    });

    it("should display available balance when categories are selected", () => {
      render(
        <CategoryDetailsToggle
          {...defaultProps}
          hasSelectedCategories={true}
        />,
      );

      expect(screen.getByText("Available Balance")).toBeInTheDocument();
    });

    it("should update month name dynamically", () => {
      render(
        <CategoryDetailsToggle {...defaultProps} currentMonthName="February" />,
      );

      expect(screen.getByText("February's Balance")).toBeInTheDocument();
    });
  });

  describe("Available Component", () => {
    it("should show available balance when categories are selected", () => {
      render(
        <CategoryDetailsToggle
          {...defaultProps}
          hasSelectedCategories={true}
          available={750.25}
        />,
      );

      const availableComponent = screen.getByText("£750.25");
      expect(availableComponent).toBeInTheDocument();
      expect(availableComponent).toHaveClass("bg-green-200");
    });

    it("should not show available balance when no categories are selected", () => {
      render(<CategoryDetailsToggle {...defaultProps} />);

      expect(screen.queryByText("£1,500.50")).not.toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("should call toggleOpen when clicked", () => {
      const mockToggleOpen = vi.fn();
      render(
        <CategoryDetailsToggle {...defaultProps} toggleOpen={mockToggleOpen} />,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockToggleOpen).toHaveBeenCalledTimes(1);
    });

    it("should call toggleOpen multiple times when clicked multiple times", () => {
      const mockToggleOpen = vi.fn();
      render(
        <CategoryDetailsToggle {...defaultProps} toggleOpen={mockToggleOpen} />,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockToggleOpen).toHaveBeenCalledTimes(3);
    });
  });
});
