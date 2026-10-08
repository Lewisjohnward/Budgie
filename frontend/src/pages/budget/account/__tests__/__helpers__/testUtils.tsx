import { render, screen } from "@testing-library/react";
import BudgetPage from "../../../Budget";
import Account from "../../Account";
import { Provider } from "react-redux";
import { createStore } from "@/core/store/store";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

function CurrentPath() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

export const renderAccountRedirectTest = (store = createStore()) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/budget/account/fake"]}>
        <Routes>
          <Route path="/budget" element={<BudgetPage />}>
            <Route path="account/:accountId" element={<Account />} />
          </Route>

          <Route
            path="/budget/account/all"
            element={<div>All accounts destination</div>}
          />
          <Route
            path="/budget/allocation"
            element={<div>Allocation destination</div>}
          />
        </Routes>
        <CurrentPath />
      </MemoryRouter>
    </Provider>
  );
};

export const queryFormRow = () =>
  screen.queryByRole("row", { name: "Add transaction form" });
export const findFormRow = () =>
  screen.findByRole("row", { name: "Add transaction form" });
export const findTransactionRow = (memo: string) =>
  screen.findByRole("row", { name: new RegExp(memo, "i") });
