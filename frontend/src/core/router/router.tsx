import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  AccountSettingsPage,
  BudgetPage,
  ForgotPassword,
  LandingPage,
  LoginPage,
  NotFoundPage,
} from "@/pages";
import { RequireAuth } from "@/core/components";
import Signup from "@/pages/signup/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/budget",
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    errorElement: <NotFoundPage />,
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
