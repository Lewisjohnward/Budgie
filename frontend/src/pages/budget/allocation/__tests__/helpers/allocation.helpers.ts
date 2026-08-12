import { screen, waitFor, within } from "@testing-library/react";

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
  await waitFor(() => {
    expect(screen.queryByText(name)).toBeInTheDocument();
  });
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
