import {
  CategoryGroupId,
  CategoryId,
  MonthId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CategoryBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";
import {
  UpdatedMonthsById,
  updatedMonthsByIdSchema,
} from "@/core/schemas/editMonthSchema";
import { UpdateMonthsPayload } from "@/pages/budget/allocation/components/assign/types/assignTypes";

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
export type UpdateCategoryDto = {
  updated: {
    category: CategoryBranded;
    categories: CategoryPositionPatch[];
  };
};

// Patch for category when repositioning
export type CategoryPositionPatch = {
  id: string;
  position: number;
  categoryGroupId: string;
};

// Response to delete category
export type DeleteCategoryDto = {
  deleted: {
    category: CategoryBranded;
    months: Record<string, MonthBranded>;
  };
  updated: {
    categories: Record<string, CategoryBranded>;
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
      query: ({ categoryId, inheritingCategoryId }) => ({
        url: `${CATEGORY_ENDPOINT_URL}/${categoryId}`,
        method: "DELETE",
        body: inheritingCategoryId ? { inheritingCategoryId } : undefined,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              // Optimistically remove category
              delete draft.categories.user[arg.categoryId];

              // Optimistically remove months belonging to category
              for (const month of Object.values(draft.months)) {
                if (month.categoryId === arg.categoryId) {
                  delete draft.months[month.id];
                }
              }
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
                // Deleted

                // Category
                delete draft.categories.user[data.deleted.category.id];

                // Months
                for (const month of Object.values(data.deleted.months)) {
                  delete draft.months[month.id];
                }

                // Updated

                // Categories
                for (const category of Object.values(data.updated.categories)) {
                  draft.categories.user[category.id] = category;
                }

                // Months
                for (const month of Object.values(data.updated.months)) {
                  draft.months[month.id] = month;
                }

                // Transactions
                for (const transaction of Object.values(
                  data.updated.transactions
                )) {
                  draft.transactions[transaction.id] = transaction;
                }
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    allocateToMonths: builder.mutation<UpdatedMonthsById, UpdateMonthsPayload>({
      query: (assigned) => ({
        url: `${CATEGORY_ENDPOINT_URL}/months`,
        method: "PATCH",
        body: assigned,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;

        dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              for (const [id, month] of Object.entries(data)) {
                if (!month) continue;
                draft.months[id as MonthId] = month;
              }
            }
          )
        );
      },
    }),
  }),
});
export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAllocateToMonthsMutation,
} = categoryApiSlice;
