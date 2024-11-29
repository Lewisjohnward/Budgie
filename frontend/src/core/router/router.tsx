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
import Navbar from "@/pages/budget/components/navBar/NavBar";
import { Allocation } from "@/pages/budget/Budget";

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
        element: <div>reflect</div>,
      },
      {
        path: "accounts",
        element: <div>accounts</div>,
      },
      {
        path: "account/:accountId",
        element: <div>my account id</div>,
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
