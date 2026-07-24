import { screen } from "@testing-library/react";
import { getUser } from "./user";

export async function assertAssignView() {
  expect(screen.queryByText(/delete category/i)).toBeInTheDocument();
  expect(
    await screen.findByText(/there is money currently assigned/i)
  ).toBeInTheDocument();
}

function getDeleteButton() {
  return screen.getByRole("button", { name: /delete/i });
}
export function assertDeleteButtonDisabled() {
  const deleteButton = getDeleteButton();
  expect(deleteButton).toBeDisabled();
}

export function assertDeleteButtonEnabled() {
  const deleteButton = getDeleteButton();
  expect(deleteButton).toBeEnabled();
}

export async function assertDialogOpen() {
  expect(
    await screen.findByRole("dialog", {
      name: /delete category/i,
    })
  ).toBeInTheDocument();
}

export function assertInputValue(value: string) {
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue(value);
}

export async function assertNumberOfTransactions(amount: number) {
  expect(screen.getByText(`[${amount}]`)).toBeInTheDocument();
}

export async function assertPopoverVisible() {
  expect(await screen.findByText(/plan categories/i)).toBeInTheDocument();
}

export async function focusInput() {
  const input = screen.getByRole("textbox");
  await getUser().click(input);
  return input;
}

export async function pressCancelButton() {
  await getUser().click(screen.getByRole("button", { name: /cancel/i }));
}

export async function pressCloseButton() {
  const closeButton = screen.getByRole("button", { name: /close/i });
  await getUser().click(closeButton);
}

export async function pressDeleteButton() {
  const deleteButton = getDeleteButton();
  expect(deleteButton).toBeEnabled();
  await getUser().click(deleteButton);
}

// selects the category to inherit
export async function selectCategoryToInherit(name: string) {
  const user = getUser();
  const input = await focusInput();

  await user.type(input, name);
  await user.keyboard("{Enter}");
}
