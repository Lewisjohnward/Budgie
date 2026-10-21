import { expect, Page } from "@playwright/test";

export const createAccount = async (
  page: Page,
  {
    accountName,
    balance,
  }: {
    accountName: string;
    balance: string;
  }
): Promise<void> => {
  await page
    .getByRole("button", {
      name: /add account/i,
      exact: true,
    })
    .click();

  const dialog = page.getByRole("dialog");

  await dialog
    .getByRole("textbox", { name: "Give it a nickname" })
    .fill(accountName);

  await dialog
    .getByRole("button", {
      name: /select account type.../i,
      exact: true,
    })
    .click();

  await dialog
    .getByRole("button", {
      name: /bank account/i,
      exact: true,
    })
    .click();

  await dialog
    .getByRole("textbox", {
      name: "What is your current account balance?",
    })
    .fill(balance);

  await dialog
    .getByRole("button", {
      name: /next/i,
      exact: true,
    })
    .click();
};

export const formatCurrency = (amount: number): string => {
  const formattedAmount = Math.abs(amount).toFixed(2);
  const sign = amount < 0 ? "-" : "";

  return `£ ${sign}${formattedAmount}`;
};

export const assertAccountBalance = async (
  page: Page,
  accountName: string,
  expectedBalance: number
): Promise<void> => {
  const formattedBalance = formatCurrency(expectedBalance);

  const balance = page.getByTestId("account-balance");
  await expect(balance.locator("dd")).toHaveText(formattedBalance);

  const account = page.getByRole("link", { name: accountName });
  await expect(account.getByText(formattedBalance)).toBeVisible();
};
