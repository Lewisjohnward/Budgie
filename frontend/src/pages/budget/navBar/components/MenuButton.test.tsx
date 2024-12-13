import { fireEvent, render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit/react";
import { Provider } from "react-redux";

import { MenuButton } from "./MenuButton";
import authReducer, { AuthState } from "@/core/auth/authSlice";

describe("MenuButton Component", () => {
  const renderWithProviders = (
    ui: React.ReactNode,
    initialAuthState: AuthState,
  ) => {
    const store = createMockStore(initialAuthState);
    return render(<Provider store={store}>{ui}</Provider>);
  };

  const renderComponent = ({
    displayText,
    animate = false,
    authState,
  }: {
    displayText: boolean;
    animate?: boolean;
    authState: AuthState;
  }) => {
    renderWithProviders(
      <MenuButton displayText={displayText} animate={animate} />,
      authState,
    );
    return {
      email: screen.queryByText(/test@test.com/i),
      expandedInfo: screen.queryByTestId("expanded-info"),
      icon: screen.queryByTestId("icon"),
    };
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

  const loggedInAuthState = {
    email: "test@test.com",
    token: null,
  };

  const loggedOutAuthState = {
    email: null,
    token: null,
  };

  it("Renders component", () => {
    const { expandedInfo } = renderComponent({
      displayText: true,
      authState: loggedInAuthState,
    });

    expect(expandedInfo).toBeInTheDocument();
  });

  it("Displays email address when logged in", () => {
    const { expandedInfo, email } = renderComponent({
      displayText: true,
      authState: loggedInAuthState,
    });

    expect(expandedInfo).toBeInTheDocument();
    expect(email).toBeInTheDocument();
  });

  it("Displays no text when logged out", () => {
    const { email } = renderComponent({
      displayText: true,
      authState: loggedOutAuthState,
    });

    expect(email).not.toBeInTheDocument();
  });

  it("Does not display expanded info when displayText is false", () => {
    const { expandedInfo } = renderComponent({
      displayText: false,
      authState: loggedOutAuthState,
    });

    expect(expandedInfo).not.toBeInTheDocument();
  });

  it("Applies animation class when mouse is over button", () => {
    renderComponent({
      displayText: false,
      authState: loggedOutAuthState,
    });

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    const icon = screen.getByTestId("icon");
    expect(icon).toHaveClass("animate-shake");
  });
});
