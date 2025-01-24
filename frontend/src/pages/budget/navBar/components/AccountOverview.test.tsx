import { fireEvent, render, screen } from "@testing-library/react";
import authReducer, { AuthState } from "@/core/auth/authSlice";
import { AccountOverview } from "./AccountOverview";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/core/api/apiSlice";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { useGetAccountsQuery } from "@/core/api/budgetApiSlice";

vi.mock("@/core/api/budgetApiSlice", () => ({
  // ...vi.importActual("@core/api/budgetApiSlice"),
  useGetAccountsQuery: vi.fn(),
}));

const mockPopulatedData = {
  data: {
    data: {
      accounts: [
        { id: 1, name: "Account 1" },
        { id: 2, name: "Account 2" },
      ],
    },
  },
};

const mockEmptyData = {
  data: {
    data: {
      accounts: [],
    },
  },
};

describe("Account overview", () => {
  const mockToggleExpanded = vi.fn(); // Mock toggle function
  const loggedInAuthState = {
    email: "test@test.com",
    token: null,
  };

  const createMockStore = (initialAuthState: AuthState) =>
    configureStore({
      reducer: {
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      preloadedState: {
        auth: initialAuthState,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware), // Add RTK Query middleware
    });

  const renderWithProviders = (ui: React.ReactNode) => {
    const store = createMockStore(loggedInAuthState);
    return render(<Provider store={store}>{ui}</Provider>, {
      wrapper: BrowserRouter,
    });
  };

  it("renders the component with accounts collapsed ", async () => {
    useGetAccountsQuery.mockReturnValueOnce(mockPopulatedData);
    renderWithProviders(
      <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    );

    expect(await screen.findByText("BUDGET")).toBeInTheDocument();

    mockPopulatedData.data.data.accounts.forEach((account) => {
      expect(screen.queryByText(account.name)).not.toBeInTheDocument();
    });

    expect(screen.getByText("Add Account")).toBeInTheDocument();
  });

  it("renders the component without accounts", () => {
    useGetAccountsQuery.mockReturnValueOnce(mockEmptyData);
    render(
      <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    );

    expect(screen.getByText(/no accounts/i)).toBeInTheDocument();
  });

  it("toggles the expanded state when the button is clicked", () => {
    useGetAccountsQuery.mockReturnValueOnce(mockPopulatedData);
    renderWithProviders(
      <AccountOverview expanded={false} toggleExpanded={mockToggleExpanded} />,
    );

    const toggleButton = screen.getByTestId("expand-accounts");

    fireEvent.click(toggleButton);

    expect(mockToggleExpanded).toHaveBeenCalledTimes(1);
  });

  it("shows account cards when expanded", () => {
    useGetAccountsQuery.mockReturnValueOnce(mockPopulatedData);

    renderWithProviders(
      <AccountOverview expanded={true} toggleExpanded={mockToggleExpanded} />,
    );

    mockPopulatedData.data.data.accounts.forEach((account) => {
      expect(screen.getByText(account.name)).toBeInTheDocument();
    });
  });

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
