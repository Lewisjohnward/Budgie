import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
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
import { PersistLogin } from "@/App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PersistLogin />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
    ],
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
        path: "",
        element: <Navigate to="allocation" replace />,
      },
      {
        path: "*",
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
        path: "account/all",
        element: <Account />,
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
