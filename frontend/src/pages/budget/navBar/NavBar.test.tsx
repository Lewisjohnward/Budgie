import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "./NavBar";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit/react";
import authReducer, { AuthState } from "@/core/auth/authSlice";
import { BrowserRouter } from "react-router-dom";
import { apiSlice } from "@/core/api/apiSlice";

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
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      preloadedState: {
        auth: initialAuthState,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware), // Add RTK Query middleware
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
  });
});
