import { screen, waitFor } from "@testing-library/react";
import { getUser } from "../../helpers/user";

// presses the delete button on a category groupcontext menu for given category group
export async function deleteCategoryGroupFromContextMenu(name: string) {
  const categoryGroup = await screen.findByText(name);
  const user = getUser();

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
