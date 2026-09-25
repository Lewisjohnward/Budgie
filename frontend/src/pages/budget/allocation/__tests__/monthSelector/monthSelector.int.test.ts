import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { setSnapshot } from "../__helpers__/msw/state";
import { renderAllocationPage } from "../__helpers__/testUtils";
import { getUser, setupUser } from "../helpers/user";
import { setupTestServer } from "../__helpers__/msw/server";
import {
  assertDisplayedMonth,
  findNavigateToTodayButton,
  navigateToNextMonth,
  queryNavigateToTodayButton,
} from "../helpers/monthSelector.helpers";
import { snapshot } from "./monthSelector.snapshot";

setupTestServer();

const setupAllocationTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  renderAllocationPage();
  return setupUser();
};

describe("month selector", () => {
  let user: ReturnType<typeof getUser>;

  beforeEach(() => {
    user = setupAllocationTest(snapshot);
  });

  it("shows the current month on initial load", async () => {
    await assertDisplayedMonth("Jul 2026");
  });

  it("hides the Today button when viewing the current month", async () => {
    await assertDisplayedMonth("Jul 2026");

    expect(queryNavigateToTodayButton()).not.toBeInTheDocument();
  });

  it("shows the Today button when viewing a different month", async () => {
    await navigateToNextMonth(user);

    expect(await findNavigateToTodayButton()).toBeInTheDocument();
  });

  it("navigates to the current month when Today is clicked", async () => {
    await navigateToNextMonth(user);

    const todayButton = await findNavigateToTodayButton();
    await user.click(todayButton);

    await assertDisplayedMonth("Jul 2026");
  });
});
