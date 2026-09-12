import { screen } from "@testing-library/react";
import { renderAllocationPage } from "../../__helpers__/testUtils";
import { setupUser } from "../../helpers/user";
import { setSnapshot } from "../../__helpers__/msw/state";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { setupTestServer } from "../../__helpers__/msw/server";
import { snapshot } from "./respositionCategory.snapshot";

setupTestServer();

const setupMoveCategoryTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  renderAllocationPage();
  setupUser();
};

describe("category", () => {
  describe("reposition", () => {
    beforeEach(() => {
      setupMoveCategoryTest(snapshot);
    });

    it("repositions a category within a group", async () => {
      // ...
    });
    it("repositions a category across groups", async () => {
      // ...
    });
  });
});
