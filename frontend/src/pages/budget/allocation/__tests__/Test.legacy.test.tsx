import { screen } from "@testing-library/react";

import { BudgetSnapshot } from "@/core/types/NormalizedData";
import { CategoryGroupId, CategoryId, MonthId } from "../types/types";
import { setupTestServer } from "./__helpers__/serverHandlers";
import { renderAllocationPage } from "./__helpers__/testUtils";

const mockBudgetSnapshot: BudgetSnapshot = {
  categoryGroups: {
    user: {
      ["food" as CategoryGroupId]: {
        id: "food" as any,
        name: "food" as any,
        position: 1,
      },
    },
    inflow: {
      id: "inflow" as any,
      name: "Inflow",
      position: 0,
    },
    uncategorised: {
      id: "uncategorised" as any,
      name: "Uncategorised",
      position: 0,
    },
  },

  categories: {
    user: {
      ["food" as CategoryId]: {
        id: "food" as any,
        categoryGroupId: "group1" as any,
        name: "Food",
        position: 1,
      },
    },
    rta: {
      id: "rta" as any,
      categoryGroupId: "group1" as any,
      name: "Ready to Assign",
      position: 0,
    },
    uncategorised: {
      id: "uncategorised" as any,
      categoryGroupId: "group1" as any,
      name: "Uncategorised",
      position: 99,
    },
  },

  months: {
    ["m1" as MonthId]: {
      id: "m1" as any,
      month: "2026-01" as any,
      activity: -250,
      assigned: 200,
      available: -50,
      categoryId: "food" as any,
    },
  },

  accounts: {},
  transactions: {},
  payees: {},
  notesByMonth: {},
  monthKeys: ["2025-08" as any],
};

describe("temp", async () => {
  setupTestServer(mockBudgetSnapshot as any);

  beforeEach(() => {
    vi.setSystemTime(new Date("2025-08-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render correctly in open state", async () => {
    renderAllocationPage();
    // findByRole / getByRole / queryByRole
    const categoryDetailsButton = await screen.findByRole("button", {
      name: /August's Balance/i,
    });

    expect(categoryDetailsButton).toBeInTheDocument();
    expect(categoryDetailsButton).toHaveAttribute("aria-expanded", "true");
  });
});
