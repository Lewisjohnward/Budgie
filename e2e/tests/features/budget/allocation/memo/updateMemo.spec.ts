import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { assertMemoContent, updateMemo } from "../../helpers/memo.helpers";
import {
  navigateToNextMonth,
  navigateToPreviousMonth,
} from "../../helpers/month.helpers";

test.describe("memo", () => {
  test.describe("update", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("persists a memo for a specific month", async ({ page, request }) => {
      await setupScenario(page, request, "update-memo-base");

      await updateMemo(page, "e2e test memo");

      await navigateToNextMonth(page);
      await assertMemoContent(page, "");
      await navigateToPreviousMonth(page);

      await assertMemoContent(page, "e2e test memo");
    });

    test("memo persists after reloading the page", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "update-memo-base");

      await updateMemo(page, "e2e test memo");
      await page.reload();

      await assertMemoContent(page, "e2e test memo");
    });
  });
});
