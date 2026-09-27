import { describe, it, expect } from "vitest";
import { buildCategoryGroupMetrics } from "./buildCategoryGroupMetrics";
import {
  CategoryBranded,
  CategoryGroupBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import { CategoryGroupId, CategoryId, MonthId, MonthKey } from "../types/types";

const cg = (id: string, name: string): CategoryGroupBranded => ({
  id: id as CategoryGroupId,
  name,
  position: 0,
});

const c = (id: string, groupId: string): CategoryBranded => ({
  id: id as CategoryId,
  name: id,
  position: 0,
  categoryGroupId: groupId as CategoryGroupId,
});

const m = (
  categoryId: string,
  assigned: number,
  activity: number
): MonthBranded => ({
  id: `${categoryId}-month` as MonthId,
  categoryId: categoryId as CategoryId,
  month: "2025-01" as MonthKey,
  assigned,
  activity,
  available: assigned + activity,
});

describe("buildCategoryGroupMetrics", () => {
  it("aggregates assigned and activity per group", () => {
    const categoryGroups = {
      g1: cg("g1", "Group 1"),
      g2: cg("g2", "Group 2"),
    };

    const categories = {
      c1: c("c1", "g1"),
      c2: c("c2", "g1"),
      c3: c("c3", "g2"),
    };

    const currentCategoryMonthMap = {
      c1: m("c1", 100, -20),
      c2: m("c2", 50, -10),
      c3: m("c3", 200, -50),
    };

    // const previousCategoryMonthMap = {
    //   c1: m("c1", 100, -20),
    //   c2: m("c2", 50, -10),
    //   c3: m("c3", 200, -50),
    // };

    const result = buildCategoryGroupMetrics({
      categoryGroups,
      categories,
      currentUserCategoryMonthMap: currentCategoryMonthMap,
      // previousCategoryMonthMap,
    });

    expect(result[categoryGroups.g1.id].assigned).toBe(150);
    expect(result[categoryGroups.g1.id].activity).toBe(-30);
    expect(result[categoryGroups.g1.id].available).toBe(120);

    expect(result[categoryGroups.g2.id].assigned).toBe(200);
    expect(result[categoryGroups.g2.id].activity).toBe(-50);
    expect(result[categoryGroups.g2.id].available).toBe(150);
  });

  it("returns zero values for empty groups", () => {
    const categoryGroups = {
      g1: cg("g1", "Empty Group"),
    };

    const categories = {};
    const categoryMonthMap = {};

    const result = buildCategoryGroupMetrics({
      categoryGroups,
      categories,
      currentUserCategoryMonthMap: categoryMonthMap,
    });

    expect(result[categoryGroups.g1.id]).toEqual({
      id: "g1",
      name: "Empty Group",
      position: 0,
      assigned: 0,
      activity: 0,
      available: 0,
    });
  });

  it("ignores categories missing from categories map", () => {
    const categoryGroups = {
      g1: cg("g1", "Group 1"),
    };

    const categories = {
      c1: c("c1", "g1"),
    };

    const categoryMonthMap = {
      c1: m("c1", 100, -10),
      // not in categories - ignored
      c2: m("c2", 999, -999),
    };

    expect(() =>
      buildCategoryGroupMetrics({
        categoryGroups,
        categories,
        currentUserCategoryMonthMap: categoryMonthMap,
      })
    ).toThrow("Missing category");
  });

  it("ignores categories pointing to non-existent groups", () => {
    const categoryGroups = {
      g1: cg("g1", "Group 1"),
    };

    const categories = {
      c1: c("c1", "g1"),
      // invalid group
      c2: c("c2", "g999"),
    };

    const categoryMonthMap = {
      c1: m("c1", 100, -10),
      c2: m("c2", 50, -5),
    };

    expect(() =>
      buildCategoryGroupMetrics({
        categoryGroups,
        categories,
        currentUserCategoryMonthMap: categoryMonthMap,
      })
    ).toThrow("Missing category group");
  });

  it("handles negative and zero values correctly", () => {
    const categoryGroups = {
      g1: cg("g1", "Group 1"),
    };

    const categories = {
      c1: c("c1", "g1"),
    };

    const categoryMonthMap = {
      c1: m("c1", 0, -100),
    };

    const result = buildCategoryGroupMetrics({
      categoryGroups,
      categories,
      currentUserCategoryMonthMap: categoryMonthMap,
    });

    expect(result[categoryGroups.g1.id].assigned).toBe(0);
    expect(result[categoryGroups.g1.id].activity).toBe(-100);
    expect(result[categoryGroups.g1.id].available).toBe(-100);
  });

  it("initializes all groups even if they have no categories", () => {
    const categoryGroups = {
      g1: cg("g1", "Group 1"),
      g2: cg("g2", "Group 2"),
    };

    const categories = {
      c1: c("c1", "g1"),
    };

    const categoryMonthMap = {
      c1: m("c1", 100, -20),
    };

    const result = buildCategoryGroupMetrics({
      categoryGroups,
      categories,
      currentUserCategoryMonthMap: categoryMonthMap,
    });

    expect(result[categoryGroups.g1.id].assigned).toBe(100);
    expect(result[categoryGroups.g1.id].activity).toBe(-20);
    expect(result[categoryGroups.g1.id].available).toBe(80);

    expect(result[categoryGroups.g2.id].assigned).toBe(0);
    expect(result[categoryGroups.g2.id].activity).toBe(0);
    expect(result[categoryGroups.g2.id].available).toBe(0);
  });
});
