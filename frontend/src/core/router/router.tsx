import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import {
  AccountSettingsPage,
  BudgetPage,
  Allocation,
  Account,
  Reflect,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
  SignUpPage
} from "@/pages";
import { RedirectIfAuth, RequireAuth, PersistLogin } from "@/core/components";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PersistLogin />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "budget",
        element: (
          <RequireAuth>
            <BudgetPage />
          </RequireAuth>
        ),
        children: [
          {
            path: "",
            element: <Navigate to="allocation" replace />,
          },
          {
            path: "allocation",
            element: <Allocation />,
          },
          {
            path: "reflect",
            element: <Reflect />,
          },
          {
            path: "account/:accountId",
            element: <Account />,
          },
          {
            path: "*",
            element: <Navigate to="allocation" replace />,
          },
        ],
      },
      {
        path: "user",
        element: (
          <RedirectIfAuth>
            <Outlet />
          </RedirectIfAuth>
        ),
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "forgotpassword",
            element: <ForgotPasswordPage />,
          },
          {
            path: "signup",
            element: <SignUpPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
