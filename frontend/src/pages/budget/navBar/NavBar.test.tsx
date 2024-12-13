import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "./NavBar";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit/react";
import authReducer, { AuthState } from "@/core/auth/authSlice";
import { BrowserRouter } from "react-router-dom";

describe("Navbar component", () => {
  const loggedInAuthState = {
    email: "test@test.com",
    token: null,
  };

  const loggedOutAuthState = {
    email: null,
    token: null,
  };

  const createMockStore = (initialAuthState: AuthState) =>
    configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: initialAuthState,
      },
    });

  const renderWithProviders = (
    ui: React.ReactNode,
    initialAuthState: AuthState,
  ) => {
    const store = createMockStore(initialAuthState);
    return render(<Provider store={store}>{ui}</Provider>, {
      wrapper: BrowserRouter,
    });
  };

  it("Renders", () => {
    renderWithProviders(<Navbar />, loggedInAuthState);

    screen.debug(undefined, 1000000);
  });
});
