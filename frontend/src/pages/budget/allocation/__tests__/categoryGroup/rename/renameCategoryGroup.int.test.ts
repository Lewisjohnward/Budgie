import { baseSnapshot } from "./renameCategoryGroup.snapshot";
import {
  mockRenameCategoryGroupFailure,
  mockRenameCategoryGroupResponse,
  renameCategoryGroupHandler,
} from "./renameCategoryGroup.msw";
import { setupUser } from "../../helpers/user";
import {
  assertCategoryGroupRemoved,
  assertCategoryGroupVisible,
} from "../../helpers/allocation.helpers";
import {
  renameCategoryGroup,
  pressAcceptButton,
  assertDuplicateCategoryGroupNameMessageVisible,
  assertAcceptButtonDisabled,
  openContextMenuForCategoryGroup,
  assertInputHasText,
} from "../../helpers/contextMenu.helpers";
import { pressCancelButton } from "../../helpers/deleteDialog.helpers";
import { pressEnter } from "../../helpers/global.helpers";
import { renderAllocationPage } from "../../__helpers__/testUtils";
import { server, setupTestServer } from "../../__helpers__/msw/server";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { setSnapshot } from "../../__helpers__/msw/state";

setupTestServer();

const setupRenameCategoryGroupTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  server.use(renameCategoryGroupHandler);
  renderAllocationPage();
  setupUser();
};

const ORIGINAL_NAME = "Important";
const NEW_NAME = "Holiday";

describe("category group", () => {
  describe("rename", () => {
    beforeEach(() => {
      setupRenameCategoryGroupTest(baseSnapshot);
    });

    it("uses the selected category group's name when opening the context menu", async () => {
      await openContextMenuForCategoryGroup("Other");

      await assertInputHasText("Other");
    });

    it("renames a category group when pressing Enter", async () => {
      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);

      await pressEnter();

      await assertCategoryGroupRemoved(ORIGINAL_NAME);
      await assertCategoryGroupVisible(NEW_NAME);
    });

    it("renames a category group when clicking OK", async () => {
      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);

      await pressAcceptButton();

      await assertCategoryGroupRemoved(ORIGINAL_NAME);
      await assertCategoryGroupVisible(NEW_NAME);
    });

    it("does not rename when cancelled", async () => {
      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);

      await pressCancelButton();

      await assertCategoryGroupVisible(ORIGINAL_NAME);
      await assertCategoryGroupRemoved(NEW_NAME);
    });

    it("displays category group name already exists message", async () => {
      await renameCategoryGroup(ORIGINAL_NAME, "Other");

      assertDuplicateCategoryGroupNameMessageVisible();
    });

    it("does not enable rename when the name is unchanged", async () => {
      await renameCategoryGroup(ORIGINAL_NAME, ORIGINAL_NAME);

      assertAcceptButtonDisabled();
    });

    it("reverts the rename when the request fails", async () => {
      mockRenameCategoryGroupFailure();

      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);
      await pressEnter();

      await assertCategoryGroupVisible(ORIGINAL_NAME);
      await assertCategoryGroupRemoved(NEW_NAME);
    });

    it.only("applies the category group returned by the server", async () => {
      mockRenameCategoryGroupResponse((name) => `${name} from server`);

      await renameCategoryGroup(ORIGINAL_NAME, NEW_NAME);
      await pressEnter();

      await assertCategoryGroupRemoved(ORIGINAL_NAME);
      await assertCategoryGroupVisible("Holiday from server");
    });
  });
});
