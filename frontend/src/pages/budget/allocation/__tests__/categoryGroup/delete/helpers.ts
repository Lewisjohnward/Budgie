import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

let user: ReturnType<typeof userEvent.setup>;

export function setupUser() {
  user = userEvent.setup();
  return user;
}

// presses the delete button on a category groupcontext menu for given category group
export async function deleteCategoryGroupFromContextMenu(name: string) {
  const categoryGroup = await screen.findByText(name);

  await user.pointer({
    target: categoryGroup,
    keys: "[MouseRight]",
  });

  await user.click(await screen.findByRole("button", { name: /delete/i }));
}

export async function assertCategoryGroupRemoved(name: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await waitFor(() => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
}

// opens the delete dialog for category
export async function openDeleteDialog(name: string) {
  await deleteCategoryGroupFromContextMenu(name);

  expect(
    await screen.findByText(/reassign your past activity/i)
  ).toBeInTheDocument();
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
// selects the category to inherit
export async function selectCategoryToInherit(name: string) {
  const input = await focusInput();

  await user.type(input, name);
  await user.keyboard("{Enter}");
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
