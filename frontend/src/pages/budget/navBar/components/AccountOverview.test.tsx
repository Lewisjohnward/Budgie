import { fireEvent, render, screen } from "@testing-library/react";
import { AddAccountBtn } from "./AddAccountBtn";
import { AccountOverview } from "./AccountOverview";
import { mockAccounts } from "@/mockData";

describe("Account overview", () => {
  const mockToggleExpanded = vi.fn(); // Mock toggle function

  it("renders the component with accounts collapsed ", () => {
    render(
      <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    );

    expect(screen.getByText(/budget/i)).toBeInTheDocument();
    mockAccounts.forEach((account) => {
      expect(screen.queryByText(account.name)).not.toBeInTheDocument();
    });
    expect(screen.getByText("Add Account")).toBeInTheDocument();
  });
  it("renders the component without accounts", () => {
    vi.mock("@/mockData", () => ({ mockAccounts: [] })); // Mock empty accounts

    render(
      <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    );

    expect(screen.getByText(/no accounts/i)).toBeInTheDocument();
  });

  it.todo("toggles the expanded state when the button is clicked", () => {
    render(
      <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    );

    screen.debug();
    const toggleButton = screen.getByTestId("expand-accounts");

    fireEvent.click(toggleButton);

    // Verify that the toggleExpanded function was called
    expect(mockToggleExpanded).toHaveBeenCalledTimes(1);
  });
  //
  // it("shows account cards when expanded", () => {
  //   render(
  //     <AccountOverview expanded={true} toggleExpanded={mockToggleExpanded} />,
  //   );
  //
  //   // Check if each account card is rendered
  //   mockAccounts.forEach((account) => {
  //     expect(screen.getByText(account.name)).toBeInTheDocument();
  //   });
  // });
  //
  // it("shows the ChevronDownIcon in the correct state", () => {
  //   const { rerender } = render(
  //     <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
  //   );
  //
  //   // Verify ChevronDownIcon is rotated when not expanded
  //   const chevronIcon = screen.getByRole("img"); 
  //   expect(chevronIcon).toHaveClass("-rotate-90");
  //
  //   // Rerender with expanded state
  //   rerender(
  //     <AccountOverview expanded={true} toggleExpanded={mockToggleExpanded} />,
  //   );
  //
  //   // Verify ChevronDownIcon is not rotated when expanded
  //   expect(chevronIcon).not.toHaveClass("-rotate-90");
  // });
});
