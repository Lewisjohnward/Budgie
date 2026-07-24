import { screen, within } from "@testing-library/react";

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
