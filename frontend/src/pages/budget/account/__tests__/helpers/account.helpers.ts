import { screen } from "@testing-library/react";

export const assertAccountTitle = async (title: string) => {
  expect(
    await screen.findByRole("heading", { name: title })
  ).toBeInTheDocument();
};
