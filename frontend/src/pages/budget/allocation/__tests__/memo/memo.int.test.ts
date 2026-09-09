import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { server, setupTestServer } from "../__helpers__/msw/server";
import { setSnapshot } from "../__helpers__/msw/state";
import { renderAllocationPage } from "../__helpers__/testUtils";
import { assertMemoContains, getMemoTextBox } from "../helpers/memo.helpers";
import { navigateToNextMonth } from "../helpers/monthSelector.helpers";
import { setupUser, getUser } from "../helpers/user";
import { editMemoHandler } from "./memo.msw";
import {
  baseSnapshot,
  INITIAL_TEST_MEMO_CONTENT_1,
  INITIAL_TEST_MEMO_CONTENT_2,
} from "./memo.snapshot";

setupTestServer();

const setupEditMemoTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  server.use(editMemoHandler);
  renderAllocationPage();
  setupUser();
};

describe("memo", () => {
  beforeEach(() => {
    setupEditMemoTest(baseSnapshot);
  });

  describe("display", () => {
    it("displays the memo for the current month", async () => {
      await assertMemoContains(INITIAL_TEST_MEMO_CONTENT_1);
    });
    it("displays the memo belonging to the selected month", async () => {
      const textBox = await getMemoTextBox();

      const user = getUser();

      await navigateToNextMonth(user);

      expect(textBox).toHaveValue(INITIAL_TEST_MEMO_CONTENT_2);
    });
  });

  describe("editing", () => {
    it("allows the user to edit the memo", async () => {
      const textBox = await getMemoTextBox();

      expect(textBox).toHaveValue(INITIAL_TEST_MEMO_CONTENT_1);

      await getUser().clear(textBox);
      await getUser().type(textBox, "Updated memo");

      expect(textBox).toHaveValue("Updated memo");
    });
  });
});
