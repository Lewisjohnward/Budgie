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
};

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    editCategory: builder.mutation<CategoryBranded, UpdateCategoryInput>({
      query: ({ categoryId, name }) => ({
        // TODO:(lewis 2026-05-18 13:47) shouldnt this be using params?
        url: `budget/category`,
        method: "PATCH",
        body: { categoryId, name },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const cat = draft.categories.user[arg.categoryId];
              if (cat) {
                if (arg.name !== undefined) cat.name = arg.name;
                if (arg.categoryGroupId !== undefined) {
                  cat.categoryGroupId = arg.categoryGroupId;
                }
              }
            }
          )
        );

        try {
          const { data: updatedCategory } = await queryFulfilled;

          dispatch(
            budgetSnapshotSlice.util.updateQueryData(
              "getBudgetSnapshot",
              undefined,
              (draft) => {
                const cat = draft.categories.user[updatedCategory.id];

                if (cat) {
                  Object.assign(cat, updatedCategory);
                }
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useEditCategoryMutation } = categoryApiSlice;
