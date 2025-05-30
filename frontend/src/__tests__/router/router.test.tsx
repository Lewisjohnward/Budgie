import { render, screen} from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import router from "@/core/router/router";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
import authReducer from "@/core/slices/authSlice";
import { AuthState } from "@/core/slices/authSlice";

let mockStore: any;

vi.mock("@/core/components", async (importOriginal) => {
  const actual = await importOriginal();
  const mockLocation = { pathname: "/" };
  return {
    ...(actual as object),
    PersistLogin: vi.fn(() => <Outlet />),
    RequireAuth: vi.fn(({ children }) => {
      const { accessToken } = mockStore.getState().auth;
      return accessToken ? (
        children
      ) : (
        <Navigate to="/" state={{ from: mockLocation }} replace />
      );
    }),
  };
});

vi.mock("@/pages", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    LandingPage: vi.fn(({ children }) => (
      <div data-testid="landing-page">{children}</div>
    )),
    BudgetPage: vi.fn(() => (
      <div data-testid="budget-page"><Outlet /></div>
    )),
    Allocation: vi.fn(({ children }) => (
      <div data-testid="allocation-page">{children}</div>
    )),
    Account: vi.fn(({ children }) => (
      <div data-testid="account-page">{children}</div>
    )),
    Reflect: vi.fn(({ children }) => (
      <div data-testid="reflect-page">{children}</div>
    )),
    NotFoundPage: vi.fn(({ children }) => (
      <div data-testid="not-found-page">{children}</div>
    )),
    LoginPage: vi.fn(({ children }) => (
      <div data-testid="login-page">{children}</div>
    )),
    ForgotPasswordPage: vi.fn(({ children }) => (
      <div data-testid="forgot-password-page">{children}</div>
    )),
    SignUpPage: vi.fn(({ children }) => (
      <div data-testid="signup-page">{children}</div>
    )),
  };
});

const loggedInAuthState: AuthState = {
  email: "test@test.com",
  accessToken: "mock-token",
};

const createMockStore = (initState : AuthState = {email: null, accessToken: null}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: initState,
    },
  });
};

describe("Router", () => {
  const renderWithRouter = (
    initialEntries = ["/"],
    initialState?: AuthState,
  ) => {
    mockStore = createMockStore(initialState);
    const testRouter = createMemoryRouter(router.routes, { initialEntries });

    const renderResult = render(
      <Provider store={mockStore}>
        <RouterProvider router={testRouter} />
      </Provider>,
    );


    return { router: testRouter, rerender: renderResult.rerender };
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render landing page for root route", () => {
    renderWithRouter(["/"]);
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("should redirect unauthenticated to landing page for protected routes", async () => {
    renderWithRouter(["/budget"]);
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("should allow authenticated users to access protected routes", () => {
    renderWithRouter(["/budget/allocation"], loggedInAuthState);
    expect(screen.getByTestId("budget-page")).toBeInTheDocument();
  });

  it("should redirect /budget to /budget/allocation", () => {
    renderWithRouter(["/budget"], loggedInAuthState);
    
    expect(screen.getByTestId("allocation-page")).toBeInTheDocument();
  });

  it("should redirect /budget/fake to /budget/allocation", () => {
    renderWithRouter(["/budget/fake"], loggedInAuthState);
    
    expect(screen.getByTestId("allocation-page")).toBeInTheDocument();
  });

  it("Should do what when navigating to home/fake", () => {
    renderWithRouter(["/home/fake"], loggedInAuthState);
    
    expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
  })

  it("should redirect /budget/account/ to /budget/allocation", () => {
    renderWithRouter(["/budget/account"], loggedInAuthState);
    
    expect(screen.getByTestId("allocation-page")).toBeInTheDocument();
  });

  it("should show 404 page for unknown routes", () => {
    renderWithRouter(["/non-existent-route"]);
    expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
  });

  it("should allow access login route when not authenticated", () => {
    renderWithRouter(["/user/login"]);
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });
  
  it("should allow access signup route when not authenticated", () => {
    renderWithRouter(["/user/signup"]);
    expect(screen.getByTestId("signup-page")).toBeInTheDocument();
  });
  
  it("should allow access forgotpassword route when not authenticated", () => {
    renderWithRouter(["/user/forgotpassword"]);
    expect(screen.getByTestId("forgot-password-page")).toBeInTheDocument();
  });

  it("should persist login state across page refreshes", () => {
    const { rerender } = renderWithRouter(["/budget/allocation"], loggedInAuthState);

    const store = createMockStore(loggedInAuthState);
    rerender(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    )

    expect(screen.getByTestId("allocation-page")).toBeInTheDocument();

    const state = store.getState();
    expect(state.auth.accessToken).toBeTruthy();

  })
});
