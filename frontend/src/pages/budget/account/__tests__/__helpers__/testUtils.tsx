import { render, screen } from "@testing-library/react";
import BudgetPage from "../../../Budget";
import Account from "../../Account";
import { Provider } from "react-redux";
import { createStore } from "@/core/store/store";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export const renderAccountPage = (
  accountId = "acc1",
  store = createStore()
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/budget/account/${accountId}`]}>
        <Routes>
          <Route path="/budget" element={<BudgetPage />}>
            <Route path="account/:accountId" element={<Account />} />
          </Route>
        </Routes>
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
