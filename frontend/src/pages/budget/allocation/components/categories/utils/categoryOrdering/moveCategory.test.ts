import { describe, expect, it } from "vitest";
import { moveCategory } from "./moveCategory";
import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";

const createView = () =>
  [
    {
      group: {
        id: "group-1",
        name: "Everyday",
      },
      rows: [
        {
          category: {
            id: "category-1",
            categoryGroupId: "group-1",
            name: "Groceries",
          },
        },
        {
          category: {
            id: "category-2",
            categoryGroupId: "group-1",
            name: "Gym",
          },
        },
        {
          category: {
            id: "category-3",
            categoryGroupId: "group-1",
            name: "Broadband",
          },
        },
      ],
    },
    {
      group: {
        id: "group-2",
        name: "Bills",
      },
      rows: [
        {
          category: {
            id: "category-4",
            categoryGroupId: "group-2",
            name: "Rent",
          },
        },
        {
          category: {
            id: "category-5",
            categoryGroupId: "group-2",
            name: "Insurance",
          },
        },
      ],
    },
  ] as MappedCategoryGroupViewWithMetrics[];

describe("moveCategory", () => {
  it("moves a category to the beginning of the same group", () => {
    const { view, updatedCategory } = moveCategory(
      createView(),
      "category-2",
      "category-1"
    );

    expect(view[0].rows.map((row) => row.category.name)).toEqual([
      "Gym",
      "Groceries",
      "Broadband",
    ]);

    expect(updatedCategory).toEqual({
      categoryId: "category-2",
      categoryGroupId: "group-1",
      position: 0,
    });
  });

  it("moves a category to the end of the same group", () => {
    const { view, updatedCategory } = moveCategory(
      createView(),
      "category-1",
      "category-3"
    );

    expect(view[0].rows.map((row) => row.category.name)).toEqual([
      "Gym",
      "Broadband",
      "Groceries",
    ]);

    expect(updatedCategory).toEqual({
      categoryId: "category-1",
      categoryGroupId: "group-1",
      position: 2,
    });
  });

  it("moves a category across groups", () => {
    const { view, updatedCategory } = moveCategory(
      createView(),
      "category-2",
      "category-4"
    );

    expect(view[0].rows.map((row) => row.category.name)).toEqual([
      "Groceries",
      "Broadband",
    ]);

    expect(view[1].rows.map((row) => row.category.name)).toEqual([
      "Gym",
      "Rent",
      "Insurance",
    ]);

    expect(updatedCategory).toEqual({
      categoryId: "category-2",
      categoryGroupId: "group-2",
      position: 0,
    });
  });
  it("moves a category to the middle of another group", () => {
    const { view, updatedCategory } = moveCategory(
      createView(),
      "category-2",
      "category-5"
    );

    expect(view[0].rows.map((row) => row.category.name)).toEqual([
      "Groceries",
      "Broadband",
    ]);

    expect(view[1].rows.map((row) => row.category.name)).toEqual([
      "Rent",
      "Gym",
      "Insurance",
    ]);

    expect(updatedCategory).toEqual({
      categoryId: "category-2",
      categoryGroupId: "group-2",
      position: 1,
    });
  });
  it("moves a category to the end of another group", () => {
    const { view, updatedCategory } = moveCategory(
      createView(),
      "category-2",
      "group-2"
    );

    expect(view[0].rows.map((row) => row.category.name)).toEqual([
      "Groceries",
      "Broadband",
    ]);

    expect(view[1].rows.map((row) => row.category.name)).toEqual([
      "Rent",
      "Insurance",
      "Gym",
    ]);

    expect(updatedCategory).toEqual({
      categoryId: "category-2",
      categoryGroupId: "group-2",
      position: 2,
    });
  });
});
