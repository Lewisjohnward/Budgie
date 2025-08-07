import { describe, it, expect } from "vitest";
import { Category } from "@/core/types/NormalizedData";
import { Month } from "@/core/types/Allocation";

describe.skip("calculateCategoryTotals", () => {
  const mockMonths: Record<string, Month> = {
    m1_jan: {
      id: "m1_jan",
      categoryId: "c1",
      month: "2023-01",
      assigned: 50,
      activity: -20,
      available: 30,
    },
    m1_feb: {
      id: "m1_feb",
      categoryId: "c1",
      month: "2023-02",
      assigned: 60,
      activity: -30,
      available: 30,
    },
    m2_jan: {
      id: "m2_jan",
      categoryId: "c2",
      month: "2023-01",
      assigned: 80,
      activity: -10,
      available: 70,
    },
    m2_feb: {
      id: "m2_feb",
      categoryId: "c2",
      month: "2023-02",
      assigned: 100,
      activity: -50,
      available: 50,
    },
    m3_jan: {
      id: "m3_jan",
      categoryId: "c3",
      month: "2023-01",
      assigned: 150,
      activity: 0,
      available: 150,
    },
    m3_feb: {
      id: "m3_feb",
      categoryId: "c3",
      month: "2023-02",
      assigned: 200,
      activity: 0,
      available: 200,
    },
  };

  const mockCategories: Category[] = [
    {
      id: "c1",
      name: "Groceries",
      months: ["m1_jan", "m1_feb"],
      categoryGroupId: "g1",
      userId: "user1",
      position: 0,
    },
    {
      id: "c2",
      name: "Utilities",
      months: ["m2_jan", "m2_feb"],
      categoryGroupId: "g1",
      userId: "user1",
      position: 1,
    },
    {
      id: "c3",
      name: "Transport",
      months: ["m3_jan", "m3_feb"],
      categoryGroupId: "g2",
      userId: "user1",
      position: 2,
    },
  ];

  it("should calculate totals for a single category", () => {
    const selected = [mockCategories[0]];
    const totals = calculateCategoryTotals(selected, mockMonths, 1);
    expect(totals.assigned).toBe(60);
    expect(totals.spending).toBe(-30);
    expect(totals.available).toBe(30);
    expect(totals.leftover).toBe(30);
  });

  it("should sum totals for multiple categories", () => {
    const selected = [mockCategories[0], mockCategories[1]];
    const totals = calculateCategoryTotals(selected, mockMonths, 1);
    expect(totals.assigned).toBe(160);
    expect(totals.spending).toBe(-80);
    expect(totals.available).toBe(80);
    expect(totals.leftover).toBe(100);
  });

  it("should return all zeros when no categories are selected", () => {
    const selected: Category[] = [];
    const totals = calculateCategoryTotals(selected, mockMonths, 1);
    expect(totals.assigned).toBe(0);
    expect(totals.spending).toBe(0);
    expect(totals.available).toBe(0);
    expect(totals.leftover).toBe(0);
  });

  it("should have a leftover of 0 when calculating for the first month (index 0)", () => {
    const selected = [mockCategories[0]];
    const totals = calculateCategoryTotals(selected, mockMonths, 0);
    expect(totals.leftover).toBe(0);
    expect(totals.assigned).toBe(50);
  });

  it("should return all zeros if a month contains only zero values", () => {
    const zeroMonth: Month = {
      id: "m4_mar",
      categoryId: "c4",
      month: "2023-03",
      assigned: 0,
      activity: 0,
      available: 0,
    };
    const zeroCat: Category = {
      id: "c4",
      name: "ZeroCat",
      months: ["m4_mar"],
      categoryGroupId: "g3",
      userId: "user1",
      position: 0,
    };
    const totals = calculateCategoryTotals([zeroCat], { m4_mar: zeroMonth }, 0);
    expect(totals.assigned).toBe(0);
    expect(totals.spending).toBe(0);
    expect(totals.available).toBe(0);
    expect(totals.leftover).toBe(0);
  });
});
