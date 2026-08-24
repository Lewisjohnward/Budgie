import { screen, waitFor, within } from "@testing-library/react";
import { getUser } from "./user";

export async function assertReadyToAssign(amount: string) {
  const button = await screen.findByRole("button", {
    name: /ready to assign/i,
  });

  expect(button).toHaveTextContent(amount);
}

export async function assertCategoryRemoved(name: string) {
  await waitFor(() => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
}

export async function assertCategoryVisible(name: string) {
  await waitFor(() => {
    expect(screen.queryByText(name)).toBeInTheDocument();
  });
}

export async function assertCategoryGroupRemoved(name: string) {
  await waitFor(() => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
}

export async function assertCategoryGroupVisible(name: string) {
  expect(await screen.findByText(name)).toBeInTheDocument();
}

export const expectCategoryAmounts = (
  category: string,
  amounts: {
    activity?: string | RegExp;
    available?: string | RegExp;
  }
): void => {
  const row = screen.getByRole("row", {
    name: `${category} category`,
  });

  const rowQueries = within(row);

  if (amounts.activity !== undefined) {
    expect(
      rowQueries.getByRole("gridcell", { name: "activity" })
    ).toHaveTextContent(amounts.activity);
  }

  if (amounts.available !== undefined) {
    expect(
      rowQueries.getByRole("gridcell", { name: "available" })
    ).toHaveTextContent(amounts.available);
  }
};

export const getCategoryCheckbox = (name: string) =>
  screen.findByRole("checkbox", {
    name: `Select ${name}`,
  });

export const getCategoryGroupCheckbox = (name: string) =>
  screen.findByRole("checkbox", {
    name: `Select all categories in ${name}`,
  });

export const getSelectedCategories = () =>
  screen.getByRole("region", {
    name: "Selected categories",
  });

export const getEditCategoryButton = (name: string) =>
  within(getSelectedCategories()).getByRole("button", {
    name: `Edit ${name}`,
  });

export const getCategoryContextMenu = async (name: string) =>
  screen.findByRole("menu", {
    name: `Category actions for ${name}`,
  });

export const selectCategory = async (name: string) => {
  await getUser().click(await getCategoryCheckbox(name));
};

export const selectCategories = async (...names: string[]) => {
  for (const name of names) {
    await selectCategory(name);
  }
};

export const selectCategoryGroup = async (name: string) => {
  await getUser().click(await getCategoryGroupCheckbox(name));
};

export const assertCategorySelected = (name: string) => {
  expect(
    screen.getByRole("checkbox", {
      name: `Select ${name}`,
    })
  ).toBeChecked();
};

export const assertCategoryNotSelected = (name: string) => {
  expect(
    screen.getByRole("checkbox", {
      name: `Select ${name}`,
    })
  ).not.toBeChecked();
};

export const assertSelectedCategoriesContain = (...names: string[]) => {
  const selectedCategories = getSelectedCategories();

  for (const name of names) {
    expect(selectedCategories).toHaveTextContent(name);
  }
};

export const assertSelectedCategoriesNotContain = (...names: string[]) => {
  const selectedCategories = getSelectedCategories();

  for (const name of names) {
    expect(selectedCategories).not.toHaveTextContent(name);
  }
};

export const assertSelectedCategoryCount = (count: number) => {
  expect(getSelectedCategories()).toHaveTextContent(
    `${count} Categories Selected`
  );
};

export const assertEditCategoryButtonVisible = (name: string) => {
  expect(getEditCategoryButton(name)).toBeInTheDocument();
};

export const assertNoEditCategoryButtons = () => {
  expect(
    within(getSelectedCategories()).queryByRole("button", {
      name: /Edit/,
    })
  ).not.toBeInTheDocument();
};

export const assertNoCategoriesSelected = () => {
  expect(
    screen.queryByRole("region", {
      name: "Selected categories",
    })
  ).not.toBeInTheDocument();
};
