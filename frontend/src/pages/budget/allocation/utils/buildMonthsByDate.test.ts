import { describe, it, expect } from "vitest";
import { buildMonthsByDate } from "./buildMonthsByDate";
import { BuildMonthsByDateInvalidMonthKeyError } from "./buildMonthsByDate.errors";
import { CategoryId, MonthId, MonthKey } from "../types/types";
import { MonthBranded } from "@/core/types/NormalizedData";

/**
 * Test helpers for branded types
 */
const mkMonthId = (v: string) => v as MonthId;
const mkCategoryId = (v: string) => v as CategoryId;
const mkMonthKey = (v: string) => v as MonthKey;

function makeMonth(params: {
  id: MonthId;
  categoryId: CategoryId;
  month: string;
}): MonthBranded {
  return params as unknown as MonthBranded;
}

describe("buildMonthsByDate", () => {
  it("groups months by MonthKey and categoryId", () => {
    const c1 = mkCategoryId("c1");
    const c2 = mkCategoryId("c2");

    const months = {
      m1: makeMonth({
        id: mkMonthId("m1"),
        categoryId: c1,
        month: "2026-01-10",
      }),
      m2: makeMonth({
        id: mkMonthId("m2"),
        categoryId: c2,
        month: "2026-01-20",
      }),
      m3: makeMonth({
        id: mkMonthId("m3"),
        categoryId: c1,
        month: "2026-02-01",
      }),
    } as Record<MonthId, MonthBranded>;

    const monthKeys = [mkMonthKey("2026-01"), mkMonthKey("2026-02")];

    const result = buildMonthsByDate(months, monthKeys) as Record<
      MonthKey,
      Record<CategoryId, MonthBranded>
    >;

    const jan = result["2026-01"];
    const feb = result["2026-02"];

    expect(jan[c1].id).toBe("m1");
    expect(jan[c2].id).toBe("m2");
    expect(feb[c1].id).toBe("m3");
    expect(result["2026-01"][c1].id).toBe("m1");
    expect(result["2026-01"][c2].id).toBe("m2");
    expect(result["2026-02"][c1].id).toBe("m3");
  });

  it("initializes empty buckets for all monthKeys", () => {
    const monthKeys = [mkMonthKey("2026-01"), mkMonthKey("2026-02")];

    const months = {} as Record<MonthId, MonthBranded>;

    const result = buildMonthsByDate(months, monthKeys);

    expect(result["2026-01"]).toEqual({});
    expect(result["2026-02"]).toEqual({});
  });

  it("throws when derived MonthKey is not in monthKeys", () => {
    const c1 = mkCategoryId("c1");

    const months = {
      m1: makeMonth({
        id: mkMonthId("m1"),
        categoryId: c1,
        month: "2026-03-15",
      }),
    } as Record<MonthId, MonthBranded>;

    const monthKeys = [mkMonthKey("2026-01")];

    expect(() => buildMonthsByDate(months, monthKeys)).toThrow(
      BuildMonthsByDateInvalidMonthKeyError
    );
  });

  it("throws with useful error message context", () => {
    const c1 = mkCategoryId("c1");

    const months = {
      m1: makeMonth({
        id: mkMonthId("m1"),
        categoryId: c1,
        month: "2026-03-15",
      }),
    } as Record<MonthId, MonthBranded>;

    const monthKeys = [mkMonthKey("2026-01")];

    try {
      buildMonthsByDate(months, monthKeys);
      throw new Error("Expected function to throw");
    } catch (e: any) {
      expect(e).toBeInstanceOf(BuildMonthsByDateInvalidMonthKeyError);
      expect(e.message).toContain("m1");
      expect(e.message).toContain("2026-03");
    }
  });

  it("overwrites category if multiple months exist for same bucket", () => {
    const c1 = mkCategoryId("c1");

    const months = {
      m1: makeMonth({
        id: mkMonthId("m1"),
        categoryId: c1,
        month: "2026-01-01",
      }),
      m2: makeMonth({
        id: mkMonthId("m2"),
        categoryId: c1,
        month: "2026-01-20",
      }),
    } as Record<MonthId, MonthBranded>;

    const monthKeys = [mkMonthKey("2026-01")];

    const result = buildMonthsByDate(months, monthKeys);

    expect(result["2026-01"][c1].id).toBe("m2");
  });
});
