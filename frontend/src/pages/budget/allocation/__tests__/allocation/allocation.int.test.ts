import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { screen } from "@testing-library/react";
import { setSnapshot } from "../__helpers__/msw/state";
import { renderAllocationPage } from "../__helpers__/testUtils";
import { setupUser } from "../helpers/user";
import { snapshot } from "./allocation.snapshot";
import { setupTestServer } from "../__helpers__/msw/server";

setupTestServer();

const setupAllocationTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  renderAllocationPage();
  setupUser();
};

describe("allocation", () => {
  beforeEach(() => {
    setupAllocationTest(snapshot);
  });
  it("shows the current month on initial load", async () => {
    expect(
      await screen.findByLabelText("Current displayed month")
    ).toHaveTextContent("Jul 2026");
  });
});
