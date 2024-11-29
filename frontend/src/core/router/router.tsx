import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  AccountSettingsPage,
  BudgetPage,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
} from "@/pages";
import { Auth } from "@/core/components";
import Signup from "@/pages/signup/Signup";
import { Allocation } from "@/pages/budget/allocation/Allocation";
import { Account } from "@/pages/budget/account/Account";
import { Reflect } from "@/pages/budget/reflect/Reflect";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/users",
    element: (
      <Auth>
        <Outlet />
      </Auth>
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
        element: <Signup />,
      },
    ],
  },
  {
    path: "/budget",
    element: (
      <Auth required>
        <BudgetPage />
      </Auth>
    ),
    children: [
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
    ],
  },
  {
    path: "/settings",
    element: (
      <Auth required>
        <AccountSettingsPage />,
      </Auth>
    ),
  },
]);

export default router;
