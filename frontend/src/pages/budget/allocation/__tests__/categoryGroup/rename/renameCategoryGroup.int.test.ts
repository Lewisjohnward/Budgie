import { renderAllocationPage } from "../../__helpers__/testUtils";
import { baseSnapshot } from "./createBudgetSnapshot";
import { setupTestServer } from "./renameCategoryGroup.msw";
import { setSnapshot } from "./renameCategoryGroup.state";
import { setupUser } from "../../helpers/user";
import {
  assertCategoryGroupNotVisible,
  assertCategoryGroupVisible,
  pressAcceptButton,
  pressCancelButton,
  pressEnter,
  renameCategoryGroup,
} from "./renameCategoryGroup.helpers";

setupTestServer();

describe("category group", () => {
  describe("rename", () => {
    beforeEach(() => {
      setupUser();
      setSnapshot(structuredClone(baseSnapshot));
      renderAllocationPage();
    });

    it("renames a category group when pressing Enter", async () => {
      const ORIGINAL_NAME = "Important";
      const NEW_NAME = "Holiday";

      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);
      await pressEnter();
      await assertCategoryGroupNotVisible(ORIGINAL_NAME);
      await assertCategoryGroupVisible(NEW_NAME);
    });
    it("renames a category group when clicking OK", async () => {
      const ORIGINAL_NAME = "Important";
      const NEW_NAME = "Holiday";

      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);
      await pressAcceptButton();
      await assertCategoryGroupNotVisible(ORIGINAL_NAME);
      await assertCategoryGroupVisible(NEW_NAME);
    });
    it("does not rename when cancelled", async () => {
      await renameCategoryGroup("Important", "Holiday");
      await pressCancelButton();

      await assertCategoryGroupVisible("Important");
      await assertCategoryGroupNotVisible("Holiday");
    });
    it("displays category group name already exists message", async () => {
      expect(true).toBe(false);
    });
    it.skip("closing context menu and opening for different category name is correct", async () => {
      expect(true).toBe(false);
    });
  });
});
