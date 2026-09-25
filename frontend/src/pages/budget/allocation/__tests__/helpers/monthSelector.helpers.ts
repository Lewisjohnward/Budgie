import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export async function assertDisplayedMonth(month: string) {
  const displayedMonth = await screen.findByLabelText(
    /current displayed month/i
  );

  expect(displayedMonth).toHaveTextContent(month);
}

export async function findNavigateToTodayButton() {
  return await screen.findByRole("button", {
    name: /go to today/i,
  });
}

export function queryNavigateToTodayButton() {
  return screen.queryByRole("button", {
    name: /go to today/i,
  });
}

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
