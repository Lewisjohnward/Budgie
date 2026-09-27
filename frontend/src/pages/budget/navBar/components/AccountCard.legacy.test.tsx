import { fireEvent, render, screen } from "@testing-library/react";
import { AccountCard } from "./AccountCard";

describe("Account overview", () => {
  const mockToggleExpanded = vi.fn(); // Mock toggle function

  it.todo("renders the component with accounts collapsed ", () => {
    // render(<AccountCard />);

    // render(
    //   <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    // );
    //
    // expect(screen.getByText(/budget/i)).toBeInTheDocument();
    // mockAccounts.forEach((account) => {
    //   expect(screen.queryByText(account.name)).not.toBeInTheDocument();
    // });
    // expect(screen.getByText("Add Account")).toBeInTheDocument();
  });
  it.todo("renders the component without accounts", () => {
    // vi.mock("@/mockData", () => ({ mockAccounts: [] })); // Mock empty accounts
    //
    // render(
    //   <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    // );
    //
    // expect(screen.getByText(/no accounts/i)).toBeInTheDocument();
  });
});
