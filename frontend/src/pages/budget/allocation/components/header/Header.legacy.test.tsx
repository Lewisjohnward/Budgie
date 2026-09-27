import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Header } from "./Header";

const months = ["September 2025", "October 2025", "November 2025"];
const assignableAmounts = [1000, 1234.56, 500];
let monthIndex = 1;

vi.mock("../../hooks/useAllocation/useAllocation", () => ({
  useAllocation: () => ({
    monthSelector: {
      index: monthIndex,
      current: months[monthIndex],
      next: vi.fn(() => {
        if (monthIndex < months.length - 1) {
          monthIndex++;
        }
      }),
      prev: vi.fn(() => {
        if (monthIndex > 0) {
          monthIndex--;
        }
      }),
      selectCurrentMonth: vi.fn(() => {
        monthIndex = 1;
      }),
      isCurrentMonth: monthIndex === 1,
      canGoNext: monthIndex < months.length - 1,
      canGoPrev: monthIndex > 0,
    },
    assignableAmount: assignableAmounts[monthIndex],
    categoriesSelector: ["All", "Underfunded"],
  }),
}));

describe("Allocation - Header", () => {
  beforeEach(() => {
    monthIndex = 1;
  });

  it("renders month selector, assigned money, and category selectors", () => {
    render(<Header />);

    expect(screen.getByText("October 2025")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Underfunded")).toBeInTheDocument();
    expect(screen.getByText(/\$?1234\.56/)).toBeInTheDocument();
  });

  it("should render the current month and assignable amount correctly", () => {
    render(<Header />);

    expect(screen.getByText("October 2025")).toBeInTheDocument();
    expect(screen.getByText(/£\s*1234.56/)).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Underfunded")).toBeInTheDocument();
  });

  it("should change to next month when next button is clicked", () => {
    const { rerender } = render(<Header />);
    expect(screen.getByText("October 2025")).toBeInTheDocument();
    expect(screen.getByText(/1234\.56/)).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /next month/i });
    fireEvent.click(nextButton);
    rerender(<Header />);

    expect(screen.getByText("November 2025")).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.queryByText("October 2025")).not.toBeInTheDocument();
  });

  it("should change to previous month when previous button is clicked", () => {
    const { rerender } = render(<Header />);
    expect(screen.getByText("October 2025")).toBeInTheDocument();
    expect(screen.getByText(/1234\.56/)).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: /previous month/i });
    fireEvent.click(prevButton);
    rerender(<Header />);

    expect(screen.getByText("September 2025")).toBeInTheDocument();
    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.queryByText("October 2025")).not.toBeInTheDocument();
  });

  it("should do nothing when clicking next on the last month", () => {
    monthIndex = 2;
    const { rerender } = render(<Header />);

    expect(screen.getByText("November 2025")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /next month/i });
    expect(nextButton).toBeDisabled();

    fireEvent.click(nextButton);
    rerender(<Header />);

    expect(screen.getByText("November 2025")).toBeInTheDocument();
  });

  it("should do nothing when clicking prev on the first month", () => {
    monthIndex = 0;
    const { rerender } = render(<Header />);

    expect(screen.getByText("September 2025")).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: /previous month/i });
    expect(prevButton).toBeDisabled();
    fireEvent.click(prevButton);
    rerender(<Header />);

    expect(screen.getByText("September 2025")).toBeInTheDocument();
  });

  it('should return to the current month and update amount when "Today" is clicked', () => {
    monthIndex = 2;
    const { rerender } = render(<Header />);

    expect(screen.getByText("November 2025")).toBeInTheDocument();
    expect(screen.getByText(/\$?500/)).toBeInTheDocument();

    const todayButton = screen.getByRole("button", { name: /today/i });
    expect(todayButton).toBeEnabled();

    fireEvent.click(todayButton);

    rerender(<Header />);

    expect(screen.getByText("October 2025")).toBeInTheDocument();
    expect(screen.getByText(/\$?1234\.56/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /today/i })).toBeDisabled();
  });
});
