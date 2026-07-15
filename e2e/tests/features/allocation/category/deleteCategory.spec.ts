import { test, expect } from "@playwright/test";
import {
  expectCategoryMissing,
  expectCategoryPresent,
  selectCategoryToReceiveTransactions,
  openCategoryContextMenu,
  expectCategoryAmounts,
} from "./category.helpers";
import { resetDatabase, setupScenario } from "../../../../helpers/setup";
import { navigateToPreviousMonth } from "../helpers/allocation.helpers";

test.beforeEach(async () => {
  await resetDatabase();
});

test("user can delete empty category", async ({ page, request }) => {
  await setupScenario(page, request, "delete-category-base");

  await expectCategoryPresent(page, "Groceries");
  await openCategoryContextMenu(page, "Groceries");

  await page.getByRole("button", { name: /delete/i }).click();

  await expectCategoryMissing(page, "Groceries");
});

test("user can delete category with assigned money", async ({
  page,
  request,
}) => {
  await setupScenario(page, request, "delete-category-with-assigned");

  await expectCategoryPresent(page, "Groceries");

  await openCategoryContextMenu(page, "Groceries");

  await page.getByRole("button", { name: /delete/i }).click();
  await page.getByRole("button", { name: /delete/i }).click();

  await expectCategoryMissing(page, "Groceries");

  await expect(page.getByText(/all money assigned/i)).toBeVisible();
});

test("user can delete category with transactions", async ({
  page,
  request,
}) => {
  await setupScenario(page, request, "delete-category-with-transaction");

  await expectCategoryPresent(page, "Groceries");

  await openCategoryContextMenu(page, "Groceries");

  await page.getByRole("button", { name: /delete/i }).click();

  await selectCategoryToReceiveTransactions(page, "Christmas");

  await page.getByRole("button", { name: /delete/i }).click();

  await expectCategoryMissing(page, "Groceries");

  await navigateToPreviousMonth(page);

  await expectCategoryAmounts(page, "Christmas", {
    activity: /-£10.00/i,
    available: /-£10.00/i,
  });

  await page.getByText(/test account/i).click();
  await page.reload();

  const row = page.getByRole("row", {
    name: /important : christmas/i,
  });

  await expect(row).toBeVisible();
});
