import { screen } from "@testing-library/react";
import { getUser } from "./user";

// presses the delete button on a category context menu for given category
export async function deleteCategoryFromContextMenu(name: string) {
  const category = await screen.findByText(name);

  await getUser().pointer({
    target: category,
    keys: "[MouseRight]",
  });

  await getUser().click(await screen.findByRole("button", { name: /delete/i }));
}

export async function deleteCategoryGroupFromContextMenu(name: string) {
  const category = await screen.findByText(name);

  await getUser().pointer({
    target: category,
    keys: "[MouseRight]",
  });

  await getUser().click(await screen.findByRole("button", { name: /delete/i }));
}

export async function openContextMenuForCategoryGroup(name: string) {
  const categoryGroup = await screen.findByText(name);

  await getUser().pointer({
    target: categoryGroup,
    keys: "[MouseRight]",
  });

  await screen.findByRole("textbox", {
    name: /rename category group/i,
  });
}

export async function renameCategoryGroup(categoryGroup: string, name: string) {
  await openContextMenuForCategoryGroup(categoryGroup);

  await getUser().keyboard("{Control>}a{/Control}");
  await getUser().keyboard(name);
}

export async function openContextMenuForCategory(name: string) {
  const categoryGroup = await screen.findByText(name);

  await getUser().pointer({
    target: categoryGroup,
    keys: "[MouseRight]",
  });

  await screen.findByRole("textbox", {
    name: /rename category/i,
  });
}

export async function renameCategory(category: string, name: string) {
  await openContextMenuForCategory(category);

  await getUser().keyboard("{Control>}a{/Control}");
  await getUser().keyboard(name);
}

export async function getInput() {
  return screen.findByRole("textbox", { name: /rename category group/i });
}

export async function assertInputHasText(text: string) {
  expect(await getInput()).toHaveValue(text);
}

export async function pressAcceptButton() {
  await getUser().click(screen.getByRole("button", { name: /ok/i }));
}

export async function pressCancelButton() {
  const closeButton = screen.getByRole("button", { name: /cancel/i });
  await getUser().click(closeButton);
}

export function assertDuplicateCategoryGroupNameMessageVisible() {
  expect(
    screen.queryByText("A group with this name already exists")
  ).toBeInTheDocument();
}

export function assertDuplicateCategoryNameMessageVisible() {
  expect(
    screen.queryByText("A category with this name already exists")
  ).toBeInTheDocument();
}

export function assertAcceptButtonDisabled() {
  expect(screen.getByRole("button", { name: /ok/i })).toBeDisabled();
}
