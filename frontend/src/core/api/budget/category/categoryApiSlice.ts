import {
  CategoryGroupId,
  CategoryId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import { CategoryBranded } from "@/core/types/NormalizedData";

type UpdateCategoryInput = {
  categoryId: CategoryId;
  name?: string;
  categoryGroupId?: CategoryGroupId;
  position?: number;
};

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    editCategory: builder.mutation<CategoryBranded, UpdateCategoryInput>({
      query: ({ categoryId, name, position, categoryGroupId }) => ({
        // TODO:(lewis 2026-05-18 13:47) shouldnt this be using params?
        url: `budget/category`,
        method: "PATCH",
        body: { categoryId, name, position, categoryGroupId },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const categories = draft.categories.user;

              const moved = categories[arg.categoryId];
              if (!moved) return;

              const fromGroup = moved.categoryGroupId;
              const toGroup = arg.categoryGroupId ?? fromGroup;

              const toPos = arg.position ?? moved.position;

              // Group categories into arrays
              const groups: Record<string, CategoryBranded[]> = {};

              Object.values(categories).forEach((c) => {
                const g = c.categoryGroupId;
                if (!groups[g]) groups[g] = [];
                groups[g].push(c);
              });

              // Sort each group by position
              Object.values(groups).forEach((group) => {
                group.sort((a, b) => a.position - b.position);
              });

              // Remove from old group
              const fromList = groups[fromGroup];
              const [removed] = fromList.splice(
                fromList.findIndex((c) => c.id === moved.id),
                1
              );

              // Insert into new group
              // need ?? [] because list is undefined if it has not categories in a group
              const toList = groups[toGroup] ?? [];
              groups[toGroup] = toList;

              toList.splice(toPos, 0, removed);

              // Normalise all groups
              Object.values(groups).forEach((group) => {
                group.forEach((c, index) => {
                  c.position = index;
                  c.categoryGroupId = groups[toGroup].includes(c)
                    ? toGroup
                    : c.categoryGroupId;
                });
              });
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useEditCategoryMutation } = categoryApiSlice;
