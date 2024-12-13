import { fireEvent, render, screen } from "@testing-library/react";
import { Menu } from "./Menu";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit/react";
import authReducer, { AuthState } from "@/core/auth/authSlice";

describe("Menu component", () => {
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
    return render(<Provider store={store}>{ui}</Provider>);
  };

  const loggedInAuthState = {
    email: null,
    token: null,
  };

  const renderComponent = ({
    displayText = true,
    animate = false,
    authState,
  }: {
    displayText?: boolean;
    animate?: boolean;
    authState: AuthState;
  }) => {
    renderWithProviders(
      <Menu displayText={displayText} animate={animate}/>,
      authState,
    );
    return {
      button: screen.getByRole("button"),
      // accountLabel: screen.getByText(/\*account\*/i),
      // settings: screen.getByText(/settings/i),
      // email: screen.queryByText(/test@test.com/i),
      // expandedInfo: screen.queryByTestId("expanded-info"),
      // icon: screen.queryByTestId("icon"),
    };
  };

  it("Renders with buttons visible", async () => {
    const { button } = renderComponent({
      authState: loggedInAuthState,
    });

    const test = screen.getByText(/budget/i);
    fireEvent.click(test);
    //
    // expect(button).toBeInTheDocument();
    // console.log(button);
    // // button.click();
    // // fireEvent.click(button);
    //
    // screen.debug();
    // const title = await waitFor(() => screen.queryByText(/profile/i));

    // expect(title).toBeInTheDocument();

    // await waitFor(
    //   () => {
    //     expect(screen.getByText(/account/i)).toBeInTheDocument();
    //   },
    //   { timeout: 3000 },
    // ); // Wait for up to 3 seconds if needed

    const account = await screen.findByText(/account/i);
    // screen.debug();

    expect(account).toBeInTheDocument();
    // // Check if MenuButton is rendered
    // const menuButton = screen.getByRole("button");
    // expect(menuButton).toBeInTheDocument();
    //
    // // Check if 'My Account' label is rendered
    // const label = screen.getByText("My Account");
    // expect(label).toBeInTheDocument();
    //
    // // Check the menu items
    // expect(screen.getByText("Profile")).toBeInTheDocument();
    // expect(settings).toBeInTheDocument();
    // expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("Calls the logout function when 'Log out' is clicked", () => {
    expect.hasAssertions();
    //   const logoutMock = jest.fn();
    //   render(<Menu displayText={true} animate={true} logout={logoutMock} />);
    //
    //   // Trigger the dropdown
    //   fireEvent.click(screen.getByRole("button"));
    //
    //   // Find the 'Log out' item and click it
    //   fireEvent.click(screen.getByText("Log out"));
    //
    //   // Verify that the logout function is called
    //   expect(logoutMock).toHaveBeenCalledTimes(1);
  });
  //
  it("Navigates to /settings when settings pressed", () => {
    expect.hasAssertions();
    // const logoutMock = jest.fn();
    // render(<Menu displayText={true} animate={true} logout={logoutMock} />);
    //
    // // Trigger the dropdown
    // fireEvent.click(screen.getByRole("button"));
    //
    // // Click 'Profile' item
    // fireEvent.click(screen.getByText("Profile"));
    //
    // // Verify that the logout function is not called
    // expect(logoutMock).not.toHaveBeenCalled();
  });
});
