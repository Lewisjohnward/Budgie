import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  AccountSettingsPage,
  BudgetPage,
  LandingPage,
  LoginPage,
} from "../../pages";
import { ErrorPage } from "../../components";
import RequireAuth from "../../pages/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/budget",
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
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
