import { screen, waitFor } from "@testing-library/react";
import { getUser } from "../../helpers/user";

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

export async function getInput() {
  return screen.findByRole("textbox", {
    name: /rename category group/i,
  });
}

export async function renameCategoryGroup(categoryGroup: string, name: string) {
  await openContextMenuForCategoryGroup(categoryGroup);

  await getUser().keyboard(name);
}

export async function pressEnter() {
  await getUser().keyboard("{Enter}");
}

export async function pressAcceptButton() {
  await getUser().click(screen.getByRole("button", { name: /ok/i }));
}

export async function pressCancelButton() {
  const closeButton = screen.getByRole("button", { name: /cancel/i });
  await getUser().click(closeButton);
}

export async function assertCategoryGroupNotVisible(name: string) {
  // TODO:(lewis 2026-07-31 14:17)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await waitFor(() => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
}

export async function assertCategoryGroupVisible(name: string) {
  // TODO:(lewis 2026-07-31 14:17)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await waitFor(() => {
    expect(screen.queryByText(name)).toBeInTheDocument();
  });
}
