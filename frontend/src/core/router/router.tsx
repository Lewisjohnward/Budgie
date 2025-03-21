import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import {
  AccountSettingsPage,
  BudgetPage,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
} from "@/pages";
import { Auth, PersistLogin } from "@/core/components";
import Signup from "@/pages/signup/Signup";
import { Allocation } from "@/pages/budget/allocation/Allocation";
import { Account } from "@/pages/budget/account/Account";
import { Reflect } from "@/pages/budget/reflect/Reflect";

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
        path: "user",
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
    ],
  },
]);

export default router;
