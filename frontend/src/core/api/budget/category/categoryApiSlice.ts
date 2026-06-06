import {
  CategoryGroupId,
  CategoryId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CategoryBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";

const CATEGORY_ENDPOINT_URL = "budget/categories";

// Input to create category
type CreateCategoryInput = {
  name: string;
  categoryGroupId: CategoryGroupId;
};

// Input to update category
type UpdateCategoryInput = {
  categoryId: CategoryId;
  name?: string;
  categoryGroupId?: CategoryGroupId;
  position?: number;
};

// Input to update category
type DeleteCategoryInput = {
  categoryId: CategoryId;
  inheritingCategoryId: CategoryId;
};

// Response to create category
type CreateCategoryDto = {
  created: {
    category: CategoryBranded;
    months: Record<string, MonthBranded>;
  };
};
// Response to update category
type UpdateCategoryDto = CategoryBranded;
// Response to update category
// Response to delete category
type DeleteCategoryDto = {
  deleted: {
    categoryId: CategoryId;
  };

  updated: {
    transactions: Record<string, TransactionBranded>;
    months: Record<string, MonthBranded>;
  };
};

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<CreateCategoryDto, CreateCategoryInput>({
      query: (category) => ({
        url: CATEGORY_ENDPOINT_URL,
        method: "POST",
        body: category,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              // NO-OP optimistic placeholder
              // because we don't yet know server-generated IDs
            }
          )
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            budgetSnapshotSlice.util.updateQueryData(
              "getBudgetSnapshot",
              undefined,
              (draft) => {
                const { category, months } = data.created;

                draft.categories.user[category.id] = category;

                draft.categories.user[category.id] = category;

                for (const month of Object.values(months)) {
                  draft.months[month.id] = month;
                }
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    updateCategory: builder.mutation<UpdateCategoryDto, UpdateCategoryInput>({
      query: ({ categoryId, name, position, categoryGroupId }) => ({
        url: `${CATEGORY_ENDPOINT_URL}/${categoryId}`,
        method: "PATCH",
        body: { name, position, categoryGroupId },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              // TODO:(lewis 2026-06-05 04:35) this can be optimised with short curcuits
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

              // Optimistically update name
              if (arg.name !== undefined) {
                moved.name = arg.name;
              }
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
    deleteCategory: builder.mutation<DeleteCategoryDto, DeleteCategoryInput>({
      query: ({ categoryId, inheritingCategoryId }) => {
        return {
          url: `${CATEGORY_ENDPOINT_URL}/${categoryId}`,
          method: "DELETE",
          body: inheritingCategoryId,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              // Find months belonging to category
              const monthIds = Object.values(draft.months)
                .filter((m) => m.categoryId === arg.categoryId)
                .map((m) => m.id);

              // Delete category
              delete draft.categories.user[arg.categoryId];

              // Delete months
              for (const id of monthIds) {
                delete draft.months[id];
              }

              // NO-OP optimistic placeholder is optional here
              // because we don't yet know server-generated IDs
            }
          )
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            budgetSnapshotSlice.util.updateQueryData(
              "getBudgetSnapshot",
              undefined,
              (draft) => {
                const { category, months } = data.created;

                draft.categories.user[category.id] = category;

                draft.categories.user[category.id] = category;

                for (const month of Object.values(months)) {
                  draft.months[month.id] = month;
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

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
