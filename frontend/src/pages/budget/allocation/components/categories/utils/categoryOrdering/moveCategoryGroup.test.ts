import { describe, expect, it } from "vitest";
import { moveCategoryGroup } from "./moveCategoryGroup";
import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";
import { CategoryGroupWithMetrics } from "@/pages/budget/allocation/utils/assembleCategoryGroupViews";
import { asCategoryGroupId } from "@/pages/budget/allocation/types/types";

const createGroup = (
  id: string,
  name: string,
  position: number
): CategoryGroupWithMetrics => ({
  id: asCategoryGroupId(id),
  name,
  position,
  assigned: 0,
  activity: 0,
  available: 0,
  hasAssigned: false,
  transactionCount: 0,
});

const createView = (): MappedCategoryGroupViewWithMetrics[] => [
  {
    group: createGroup("group-1", "Everyday", 0),
    rows: [],
    open: true,
  },
  {
    group: createGroup("group-2", "Bills", 1),
    rows: [],
    open: true,
  },
  {
    group: createGroup("group-3", "Fun", 2),
    rows: [],
    open: true,
  },
];

describe("moveCategoryGroup", () => {
  it("moves a group forward", () => {
    const { view, updatedGroup } = moveCategoryGroup(
      createView(),
      "group-1",
      "group-3"
    );

    expect(view.map((group) => group.group.name)).toEqual([
      "Bills",
      "Fun",
      "Everyday",
    ]);

    expect(updatedGroup).toEqual({
      categoryGroupId: "group-1",
      position: 2,
    });
  });

  it("moves a group backward", () => {
    const { view, updatedGroup } = moveCategoryGroup(
      createView(),
      "group-3",
      "group-1"
    );

    expect(view.map((group) => group.group.name)).toEqual([
      "Fun",
      "Everyday",
      "Bills",
    ]);

    expect(updatedGroup).toEqual({
      categoryGroupId: "group-3",
      position: 0,
    });
  });

  it("throws when the active group does not exist", () => {
    expect(() =>
      moveCategoryGroup(createView(), "missing-group", "group-1")
    ).toThrow("Category group not found");
  });

  it("throws when the target group does not exist", () => {
    expect(() =>
      moveCategoryGroup(createView(), "group-1", "missing-group")
    ).toThrow("Category group not found");
  });
});
