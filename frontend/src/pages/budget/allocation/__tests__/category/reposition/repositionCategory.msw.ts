import { http, HttpResponse } from "msw";
import { UpdateCategoryInput } from "@/core/api/budget/category/types";
import { getSnapshot } from "../../__helpers__/msw/state";
import {
  ApiBudgetSnapshot,
  UpdateCategoryResponse,
} from "@/core/types/exported-types";

// export type UpdateCategoryBody = Omit<UpdateCategoryInput, "categoryGroupId">;

export const API_URL = import.meta.env.VITE_API_URL;

export const repositionCategoryHandler = http.patch(
  `${API_URL}/budget/categories/:id`,
  async ({ params, request }) => {
    const categoryId = params.id;

    if (typeof categoryId !== "string") {
      throw new Error("MSW handler requires a category id");
    }

    const body = (await request.json()) as UpdateCategoryInput;

    if (typeof body.categoryGroupId !== "string") {
      throw new Error("MSW handler requires body.categoryGroupId");
    }

    if (typeof body.position !== "number") {
      throw new Error("MSW handler requires body.position");
    }

    const snapshot = getSnapshot();

    const result = repositionCategoryResult(
      snapshot,
      categoryId,
      body.categoryGroupId,
      body.position
    );

    return HttpResponse.json(result);
  }
);

export function repositionCategoryResult(
  snapshot: ApiBudgetSnapshot,
  categoryId: string,
  newGroupId: string,
  toPosition: number
): UpdateCategoryResponse {
  const category = snapshot.categories.user[categoryId];

  if (!category) {
    throw new Error(`Category with id "${categoryId}" not found`);
  }

  const fromGroupId = category.categoryGroupId;
  const fromPosition = category.position;

  const categories = Object.values(snapshot.categories.user);

  if (fromGroupId === newGroupId) {
    const groupCategories = categories
      .filter((category) => category.categoryGroupId === fromGroupId)
      .sort((a, b) => a.position - b.position);

    const movedCategory = groupCategories.find(
      (category) => category.id === categoryId
    );

    if (!movedCategory) {
      throw new Error(`Category with id "${categoryId}" not found`);
    }

    // Remove it from its original position.
    groupCategories.splice(fromPosition, 1);

    // Insert it at the new position.
    groupCategories.splice(toPosition, 0, {
      ...movedCategory,
      categoryGroupId: newGroupId,
      position: toPosition,
    });

    // Recalculate positions.
    const updatedCategories = groupCategories.map((category, index) => ({
      ...category,
      position: index,
    }));

    const updatedCategory = updatedCategories.find(
      (category) => category.id === categoryId
    )!;

    return {
      updated: {
        category: updatedCategory,
        categories: updatedCategories.map((category) => ({
          id: category.id,
          position: category.position,
          categoryGroupId: category.categoryGroupId,
        })),
      },
    };
  }

  // CROSS-GROUP MOVE

  const sourceCategories = categories
    .filter((category) => category.categoryGroupId === fromGroupId)
    .sort((a, b) => a.position - b.position);

  const targetCategories = categories
    .filter((category) => category.categoryGroupId === newGroupId)
    .sort((a, b) => a.position - b.position);

  // Remove from source group.
  const movedCategory = sourceCategories.splice(fromPosition, 1)[0];

  if (!movedCategory) {
    throw new Error(
      `Category "${categoryId}" does not exist at position ${fromPosition}`
    );
  }

  // Move into target group.
  targetCategories.splice(toPosition, 0, {
    ...movedCategory,
    categoryGroupId: newGroupId,
    position: toPosition,
  });

  // Recalculate both groups.
  const updatedSourceCategories = sourceCategories.map((category, index) => ({
    ...category,
    position: index,
  }));

  const updatedTargetCategories = targetCategories.map((category, index) => ({
    ...category,
    categoryGroupId: newGroupId,
    position: index,
  }));

  const updatedCategory = updatedTargetCategories.find(
    (category) => category.id === categoryId
  )!;

  return {
    updated: {
      category: updatedCategory,
      categories: [...updatedSourceCategories, ...updatedTargetCategories].map(
        (category) => ({
          id: category.id,
          position: category.position,
          categoryGroupId: category.categoryGroupId,
        })
      ),
    },
  };
}
