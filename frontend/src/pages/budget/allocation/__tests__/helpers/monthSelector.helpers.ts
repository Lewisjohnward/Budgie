import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export async function navigateToPreviousMonth(user: UserEvent) {
  const button = await screen.findByRole("button", {
    name: /previous month/i,
  });

  await user.click(button);
}

export async function navigateToNextMonth(user: UserEvent) {
  const button = await screen.findByRole("button", {
    name: /next month/i,
  });

  await user.click(button);
}
