import { expect, Page } from "@playwright/test";

export const updateMemo = async (page: Page, memo: string): Promise<void> => {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      /\/budget\/memo\/[^/]+$/.test(response.url()) &&
      response.ok()
  );

  await page.getByRole("textbox", { name: "Monthly memo" }).fill(memo);

  await responsePromise;
};

export const assertMemoContent = async (
  page: Page,
  content: string
): Promise<void> => {
  const memo = page.getByRole("textbox", {
    name: "Monthly memo",
  });
  await expect(memo).toHaveValue(content);
};
