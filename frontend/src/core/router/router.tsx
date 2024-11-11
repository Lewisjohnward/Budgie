import { createBrowserRouter } from "react-router-dom";
import { BudgetPage, LandingPage, LoginPage } from "../../feature";
import { ErrorPage } from "../../components";

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
    element: <BudgetPage />,
  },
]);

export default router;
