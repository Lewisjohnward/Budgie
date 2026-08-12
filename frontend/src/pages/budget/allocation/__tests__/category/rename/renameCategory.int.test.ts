import { renderAllocationPage } from "../../__helpers__/testUtils";
import {
  assertCategoryRemoved,
  assertCategoryVisible,
} from "../../helpers/allocation.helpers";
import {
  pressAcceptButton,
  assertAcceptButtonDisabled,
  assertInputHasText,
  renameCategory,
  openContextMenuForCategory,
  assertDuplicateCategoryNameMessageVisible,
} from "../../helpers/contextMenu.helpers";
import { pressCancelButton } from "../../helpers/deleteDialog.helpers";
import { pressEnter } from "../../helpers/global.helpers";
import { setupUser } from "../../helpers/user";
import { baseSnapshot } from "./createBudgetSnapshot";
import {
  mockRenameCategoryFailure,
  mockRenameCategoryResponse,
  setupTestServer,
} from "./renameCategory.msw";
import { setSnapshot } from "./renameCategory.state";

setupTestServer();

const ORIGINAL_NAME = "Groceries";
const NEW_NAME = "Holiday";

describe("category", () => {
  describe("rename", () => {
    beforeEach(() => {
      setupUser();
      setSnapshot(structuredClone(baseSnapshot));
      renderAllocationPage();
    });

    it("renames a category when pressing Enter", async () => {
      await renameCategory(ORIGINAL_NAME, NEW_NAME);

      await pressEnter();

      await assertCategoryRemoved(ORIGINAL_NAME);
      await assertCategoryVisible(NEW_NAME);
    });

    it("renames a category when clicking OK", async () => {
      await renameCategory(ORIGINAL_NAME, NEW_NAME);

      await pressAcceptButton();

      await assertCategoryRemoved(ORIGINAL_NAME);
      await assertCategoryVisible(NEW_NAME);
    });

    it("does not rename when cancelled", async () => {
      await renameCategory(ORIGINAL_NAME, NEW_NAME);

      await pressCancelButton();

      await assertCategoryVisible(ORIGINAL_NAME);
      await assertCategoryRemoved(NEW_NAME);
    });

    it("does not rename to an existing category name", async () => {
      await renameCategory(ORIGINAL_NAME, "Rent");

      assertDuplicateCategoryNameMessageVisible();
      assertAcceptButtonDisabled();

      await assertCategoryVisible(ORIGINAL_NAME);
    });

    it("does not enable rename when the name is unchanged", async () => {
      await renameCategory(ORIGINAL_NAME, ORIGINAL_NAME);

      assertAcceptButtonDisabled();
    });

    it("shows the selected category name when opening the context menu", async () => {
      await openContextMenuForCategory("Other");

      await assertInputHasText("Other");
    });

    it("reverts the rename when the request fails", async () => {
      mockRenameCategoryFailure();

      await renameCategory(ORIGINAL_NAME, NEW_NAME);
      await pressEnter();

      await assertCategoryVisible(ORIGINAL_NAME);
      await assertCategoryRemoved(NEW_NAME);
    });

    it("updates the category with the name returned by the server", async () => {
      mockRenameCategoryResponse((name) => `${name} from server`);

      await renameCategory(ORIGINAL_NAME, NEW_NAME);
      await pressEnter();

      await assertCategoryRemoved(ORIGINAL_NAME);
      await assertCategoryVisible("Holiday from server");
    });
  });
});
