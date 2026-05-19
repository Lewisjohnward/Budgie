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
      query: ({ categoryId, name, position }) => ({
        // TODO:(lewis 2026-05-18 13:47) shouldnt this be using params?
        url: `budget/category`,
        method: "PATCH",
        body: { categoryId, name, position },
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

              // 1. group categories into arrays
              const groups: Record<string, CategoryBranded[]> = {};

              Object.values(categories).forEach((c) => {
                const g = c.categoryGroupId;
                if (!groups[g]) groups[g] = [];
                groups[g].push(c);
              });

              // 2. sort each group by position
              Object.values(groups).forEach((group) => {
                group.sort((a, b) => a.position - b.position);
              });

              // 3. remove from old group
              const fromList = groups[fromGroup];
              const [removed] = fromList.splice(
                fromList.findIndex((c) => c.id === moved.id),
                1
              );

              // 4. insert into new group
              const toList = groups[toGroup];
              toList.splice(toPos, 0, removed);

              // 5. normalize ALL groups (critical step)
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
          const res = await queryFulfilled;
          console.log("res:", res);
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useEditCategoryMutation } = categoryApiSlice;
