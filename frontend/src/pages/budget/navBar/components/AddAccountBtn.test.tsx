import { fireEvent, render, screen } from "@testing-library/react";
import { AddAccountBtn } from "./AddAccountBtn";
import { AuthState } from "@/core/auth/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { AuthState } from "@/core/auth/authSlice";
import { apiSlice } from "@/core/api/apiSlice";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

describe("Add account button", () => {
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
    render(<Provider store={store}>{ui}</Provider>, {
      wrapper: BrowserRouter,
    });
    return {
      button: screen.getByRole("button"),
      addIcon: screen.getByTestId("icon"),
    };
  };

  it("Renders", () => {
    const { button } = renderWithProviders(<AddAccountBtn />);
    expect(button).toBeInTheDocument();
  });

  it("shows animation on hover", () => {
    const { addIcon } = renderWithProviders(<AddAccountBtn />);
    fireEvent.mouseEnter(addIcon);
    expect(addIcon).toHaveClass("animate-shake");
  });

  it("opens the dialog when the button is clicked", () => {
    const { button } = renderWithProviders(<AddAccountBtn />);
    fireEvent.click(button);
    expect(screen.getByTestId("add-account-dialog")).toBeInTheDocument();
  });

  it.todo("prevents closing the dialog if clicking outside", () => {
    // render(<AddAccountBtn />);
    // const triggerButton = screen.getByRole("button");
    // fireEvent.click(triggerButton); // Open the dialog
    // // fireEvent.mou
    // const dialogContent = screen.getByRole("dialog");
    // fireEvent.pointerDown(dialogContent); // Simulate clicking outside
    // screen.debug();
    // expect(dialogContent).toBeInTheDocument(); // The dialog should not close
  });

  it("has proper accessibility roles and labels", () => {
    const { button } = renderWithProviders(<AddAccountBtn />);
    fireEvent.click(button);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });
});
