import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  AccountSettingsPage,
  BudgetPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
} from "../../pages";
import { RequireAuth } from "../components";

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
