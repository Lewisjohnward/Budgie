import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

let user: ReturnType<typeof userEvent.setup>;

export function setupUser() {
  user = userEvent.setup();
  return user;
}

export async function pressEscape() {
  await user.keyboard("{Escape}");
}

// presses the delete button on a category context menu for given category
export async function deleteCategoryFromContextMenu(name: string) {
  const category = await screen.findByText(name);

  await user.pointer({
    target: category,
    keys: "[MouseRight]",
  });

  await user.click(await screen.findByRole("button", { name: /delete/i }));
}

// opens the delete dialog for category
export async function openDeleteDialog(name: string) {
  await deleteCategoryFromContextMenu(name);

  expect(
    await screen.findByText(/reassign your past activity/i)
  ).toBeInTheDocument();
}

// selects the category to inherit
export async function selectCategoryToInherit(name: string) {
  const input = await focusInput();

  await user.type(input, name);
  await user.keyboard("{Enter}");
}

export async function assertDialogOpen() {
  expect(
    await screen.findByRole("dialog", {
      name: /delete category/i,
    })
  ).toBeInTheDocument();
}

export async function assertNumberOfTransactions(amount: number) {
  expect(screen.getByText(`[${amount}]`)).toBeInTheDocument();
}

export async function assertReadyToAssign(amount: string) {
  const button = await screen.findByRole("button", {
    name: /ready to assign/i,
  });

  expect(button).toHaveTextContent(amount);
}

export async function assertAssignView() {
  expect(screen.queryByText(/delete category/i)).toBeInTheDocument();
  expect(
    await screen.findByText(/there is money currently assigned/i)
  ).toBeInTheDocument();
}

export async function assertCategoryRemoved(name: string) {
  await waitFor(() => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
}

//-----
// close buttons
//-----
export async function pressCancelButton() {
  await user.click(screen.getByRole("button", { name: /cancel/i }));
}

export async function pressCloseButton() {
  const closeButton = screen.getByRole("button", { name: /close/i });
  await user.click(closeButton);
}

//-----
// input
//-----
export function getInput() {
  return screen.getByRole("textbox");
}

export async function focusInput() {
  const input = getInput();
  await user.click(input);
  return input;
}

export function assertInputValue(value: string) {
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue(value);
}

//-----
// delete button
//-----
function getDeleteButton() {
  return screen.getByRole("button", { name: /delete/i });
}
export async function pressDeleteButton() {
  const deleteButton = getDeleteButton();
  expect(deleteButton).toBeEnabled();
  await user.click(deleteButton);
}
export function assertDeleteButtonDisabled() {
  const deleteButton = getDeleteButton();
  expect(deleteButton).toBeDisabled();
}

export function assertDeleteButtonEnabled() {
  const deleteButton = getDeleteButton();
  expect(deleteButton).toBeEnabled();
}

//-----
// popover
//-----
export async function assertPopoverVisible() {
  expect(await screen.findByText(/plan categories/i)).toBeInTheDocument();
}
