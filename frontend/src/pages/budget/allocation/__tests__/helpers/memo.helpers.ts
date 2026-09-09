import { screen } from "@testing-library/react";

export async function getMemoTextBox() {
  return await screen.findByRole("textbox", {
    name: "Monthly memo",
  });
}

export async function assertMemoContains(content: string) {
  const textarea = await screen.findByRole("textbox", {
    name: "Monthly memo",
  });

  expect(textarea).toHaveValue(content);
}
