import { screen } from "@testing-library/react";

export async function assertReadyToAssign(amount: string) {
  const button = await screen.findByRole("button", {
    name: /ready to assign/i,
  });

  expect(button).toHaveTextContent(amount);
}
