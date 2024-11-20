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
        <Outlet />
      </Auth>
    ),
    children: [
      {
        path: "",
        element: <BudgetPage />,
      },
      {
        path: "settings",
        element: <AccountSettingsPage />,
      },
    ],
  },
]);

export default router;
