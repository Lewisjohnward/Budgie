import { render, screen, waitFor, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { act } from "react";
import { createStore } from "@/core/store/store";
import { selectMonthIndex } from "@/pages/budget/allocation/slices/monthSlice";
import { addCategories } from "../../slices/selectedCategorySlice";
import { Assign } from "../../components/assign/components/Assign";
import { Category } from "@/core/types/NormalizedData";
import { MemoryRouter } from "react-router-dom";
import { Routes, Route } from "react-router";
import BudgetPage from "@/pages/budget/Budget";
import Allocation from "../../Allocation";

export const renderAllocationPage = (store = createStore()) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/budget/allocation`]}>
        <Routes>
          <Route path="/budget" element={<BudgetPage />}>
            <Route path="allocation" element={<Allocation />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

export const renderAssignComponent = (store = createStore()) => {
  let result;
  result = render(
    <Provider store={store}>
      <Assign />
    </Provider>
  );
  return result!;
};

export const createStoreWithMonthIndex = (monthIndex: number) => {
  const store = createStore();
  act(() => {
    store.dispatch(selectMonthIndex(monthIndex));
  });
  return store;
};

export const selectMonth = (
  store: ReturnType<typeof createStore>,
  monthIndex: number
) => {
  act(() => {
    store.dispatch(selectMonthIndex(monthIndex));
  });
};

export const createStoreWithSelectedCategories = (categories: Category[]) => {
  const store = createStore();
  act(() => {
    store.dispatch(addCategories(categories));
  });
  return store;
};

export const clickButtonAndWaitForModal = async (
  buttonName: string | RegExp
) => {
  const button = await screen.findByRole("button", { name: buttonName });
  expect(button).toBeInTheDocument();

  await act(async () => {
    button.click();
  });
};

export const expectModalContent = async (expectedText: string | RegExp) => {
  const modal = await screen.findByRole("dialog");
  expect(modal).toBeInTheDocument();

  const message = await screen.findByText(expectedText);
  expect(message).toBeInTheDocument();
};

export const expectButtonAmount = async (buttonName: string | RegExp) => {
  let buttonElement: HTMLElement | null = null;
  await waitFor(() => {
    const button = screen.getByRole("button", { name: buttonName });
    expect(button).toBeInTheDocument();
    buttonElement = button;
  });
  return buttonElement!;
};

export const expectCategoryGroup = async (categoryName: string | RegExp) => {
  const categoryText = await screen.findByText(categoryName);
  const categoryRow = categoryText.closest('[role="row"]');
  expect(categoryRow).not.toBeNull();
};

export const expectCategoryRow = async (
  categoryName: string,
  expectedAmount: string
) => {
  const categoryText = await screen.findByText(categoryName);
  const categoryRow = categoryText.closest('[role="row"]');
  expect(categoryRow).not.toBeNull();

  const amountText = within(categoryRow as HTMLElement).getByText(
    expectedAmount
  );

  expect(amountText).toBeInTheDocument();
};

export const waitForApiResponse = async (ms = 100) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
};
