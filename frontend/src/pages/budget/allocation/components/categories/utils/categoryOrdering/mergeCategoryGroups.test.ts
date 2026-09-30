import { describe, expect, it } from "vitest";
import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";
import { mergeCategoryGroups } from "./mergeCategoryGroups";
import {
  asCategoryGroupId,
  asCategoryId,
} from "@/pages/budget/allocation/types/types";

const createView = () =>
  [
    {
      group: {
        id: "group-1",
        name: "Everyday",
        position: 0,
      },
      open: true,
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
      ],
    },
    {
      group: {
        id: "group-2",
        name: "Bills",
        position: 1,
      },
      open: true,
      rows: [
        {
          category: {
            id: "category-3",
            categoryGroupId: "group-2",
            name: "Broadband",
          },
        },
        {
          category: {
            id: "category-4",
            categoryGroupId: "group-2",
            name: "Rent",
          },
        },
      ],
    },
  ] as MappedCategoryGroupViewWithMetrics[];

describe("mergeCategoryGroups", () => {
  it("preserves an optimistic category move across groups", () => {
    const draftView = createView();

    const [movedCategory] = draftView[0].rows.splice(1, 1);
    movedCategory.category.categoryGroupId = asCategoryGroupId("group-2");
    draftView[1].rows.splice(1, 0, movedCategory);

    const serverView = createView();

    const result = mergeCategoryGroups(draftView, serverView);

    expect(result[0].rows.map((row) => row.category.name)).toEqual([
      "Groceries",
    ]);

    expect(result[1].rows.map((row) => row.category.name)).toEqual([
      "Broadband",
      "Gym",
      "Rent",
    ]);
  });

  it("preserves an optimistic category-group reorder", () => {
    const draftView = createView();

    const [movedGroup] = draftView.splice(0, 1);
    draftView.splice(1, 0, movedGroup);

    const serverView = createView();

    const result = mergeCategoryGroups(draftView, serverView);

    expect(result.map((group) => group.group.name)).toEqual([
      "Bills",
      "Everyday",
    ]);
  });

  it("preserves an optimistic category move when the server view changes", () => {
    const draftView = createView();

    const [movedCategory] = draftView[0].rows.splice(1, 1);
    movedCategory.category.categoryGroupId = asCategoryGroupId("group-2");
    draftView[1].rows.splice(1, 0, movedCategory);

    const serverView = createView();

    serverView[0].open = false;
    serverView[1].open = false;

    const result = mergeCategoryGroups(draftView, serverView);

    expect(result[0].rows.map((row) => row.category.name)).toEqual([
      "Groceries",
    ]);

    expect(result[1].rows.map((row) => row.category.name)).toEqual([
      "Broadband",
      "Gym",
      "Rent",
    ]);
  });

  it("preserves an optimistic category-group reorder when the server view changes", () => {
    const draftView = createView();

    const [movedGroup] = draftView.splice(0, 1);
    draftView.splice(1, 0, movedGroup);

    const serverView = createView();

    serverView[0].open = false;
    serverView[1].open = false;

    const result = mergeCategoryGroups(draftView, serverView);

    expect(result.map((group) => group.group.name)).toEqual([
      "Bills",
      "Everyday",
    ]);
  });
  it("reconciles added categories with the display view", () => {
    const draftView = createView();
    const serverView = createView();

    const newCategory = structuredClone(serverView[0].rows[0]);

    newCategory.category.id = asCategoryId("category-5");
    newCategory.category.categoryGroupId = asCategoryGroupId("group-1");
    newCategory.category.name = "Phone";
    newCategory.category.position = 2;

    serverView[0].rows.push(newCategory);

    const result = mergeCategoryGroups(draftView, serverView);

    expect(result[0].rows.map((row) => row.category.name)).toEqual([
      "Groceries",
      "Gym",
      "Phone",
    ]);
  });
});
