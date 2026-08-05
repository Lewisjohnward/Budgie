import {
  asCategoryGroupId,
  CategoryGroupId,
  CategoryId,
  MonthId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CategoryBranded,
  CategoryGroupBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";

const CATEGORY_GROUP_ENDPOINT_URL = "budget/category-groups";

// Input to create category group
type CreateCategoryGroupInput = {
  name: string;
};

// Input to update category group
export type UpdateCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
  name?: string;
  position?: number;
};

export type UpdateCategoryGroupBody = Omit<
  UpdateCategoryGroupInput,
  "categoryGroupId"
>;

// Input to delete category group
type DeleteCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
  inheritingCategoryId?: CategoryId;
};

// Response to create category group
type CreateCategoryGroupDto = CategoryGroupBranded;
// Response to update category group
export type UpdateCategoryGroupDto = CategoryGroupBranded;
// Response to delete category group
type DeleteCategoryGroupDto = {
  deleted: {
    categoryGroup: CategoryGroupBranded;
    categories: Record<CategoryId, CategoryBranded>;
    months: Record<MonthId, MonthBranded>;
  };

  updated: {
    categoryGroups: Record<CategoryGroupId, CategoryGroupBranded>;
    transactions: Record<TransactionId, TransactionBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};

export const categoryGroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategoryGroup: builder.mutation<
      CreateCategoryGroupDto,
      CreateCategoryGroupInput
    >({
      query: (categoryGroup) => {
        return {
          url: CATEGORY_GROUP_ENDPOINT_URL,
          method: "POST",
          body: categoryGroup,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const tempId = asCategoryGroupId(crypto.randomUUID());

        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const groups = Object.values(draft.categoryGroups.user);

              const newGroup = {
                id: tempId,
                name: arg.name,
                // Put temp newly created category group at the last position
                position: groups.length,
              };

              draft.categoryGroups.user[tempId] = newGroup;
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
                delete draft.categoryGroups.user[tempId];
                draft.categoryGroups.user[data.id] = data;
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    updateCategoryGroup: builder.mutation<
      UpdateCategoryGroupDto,
      UpdateCategoryGroupInput
    >({
      query: ({ name, position, categoryGroupId }) => ({
        url: `${CATEGORY_GROUP_ENDPOINT_URL}/${categoryGroupId}`,
        method: "PATCH",
        body: { name, position },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const groups = draft.categoryGroups.user;
              const moved = groups[arg.categoryGroupId];

              if (!moved) return;

              // Handle position update
              if (arg.position !== undefined) {
                const list = Object.values(groups);
                const fromPos = moved.position;
                const toPos = arg.position;

                if (toPos !== fromPos) {
                  const without = list.filter(
                    (g) => g.id !== arg.categoryGroupId
                  );

                  without.splice(toPos, 0, moved);

                  without.forEach((g, index) => {
                    g.position = index;
                  });

                  draft.categoryGroups.user = Object.fromEntries(
                    without.map((g) => [g.id, g])
                  );
                }
              }

              // Handle name update
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
    deleteCategoryGroup: builder.mutation<
      DeleteCategoryGroupDto,
      DeleteCategoryGroupInput
    >({
      query: ({ categoryGroupId, inheritingCategoryId }) => ({
        url: `${CATEGORY_GROUP_ENDPOINT_URL}/${categoryGroupId}`,
        method: "DELETE",
        body: inheritingCategoryId ? { inheritingCategoryId } : undefined,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistic update (remove + reorder)
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              // TODO:(lewis 2026-07-23 15:05) this doesnt recalculate rta or avaiable etc, is that problematic? should i just remove?
              const group = draft.categoryGroups.user[arg.categoryGroupId];
              if (!group) return;

              // Find categories belonging to group
              const categoryIds = Object.values(draft.categories.user)
                .filter((c) => c.categoryGroupId === arg.categoryGroupId)
                .map((c) => c.id);

              // Delete categories
              for (const id of categoryIds) {
                delete draft.categories.user[id];
              }

              // Delete months for those categories
              const categorySet = new Set(categoryIds);

              for (const [monthId, month] of Object.entries(draft.months) as [
                MonthId,
                MonthBranded,
              ][]) {
                if (categorySet.has(month.categoryId)) {
                  delete draft.months[monthId];
                }
              }

              // Delete category group
              delete draft.categoryGroups.user[arg.categoryGroupId];

              // Reindex remaining groups
              const reordered = Object.values(draft.categoryGroups.user)
                .sort((a, b) => a.position - b.position)
                .map((g, index) => {
                  g.position = index;
                  return g;
                });

              draft.categoryGroups.user = Object.fromEntries(
                reordered.map((g) => [g.id, g])
              );
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          // Apply server-confirmed side effects
          dispatch(
            budgetSnapshotSlice.util.updateQueryData(
              "getBudgetSnapshot",
              undefined,
              (draft) => {
                // TODO:(lewis 2026-07-23 15:26) these need improving can use Object.keys
                if (data.deleted?.categoryGroup) {
                  const { id } = data.deleted.categoryGroup;
                  delete draft.categoryGroups.user[id];
                }
                for (const id of Object.keys(
                  data.deleted.categories
                ) as CategoryId[]) {
                  delete draft.categories.user[id];
                }
                if (data.deleted?.months) {
                  for (const m of Object.values(data.deleted.months)) {
                    delete draft.months[m.id];
                  }
                }
                if (data.updated?.categoryGroups) {
                  for (const cg of Object.values(data.updated.categoryGroups)) {
                    draft.categoryGroups.user[cg.id] = cg;
                  }
                }
                if (data.updated?.transactions) {
                  for (const tx of Object.values(data.updated.transactions)) {
                    draft.transactions[tx.id] = tx;
                  }
                }

                if (data.updated?.months) {
                  for (const [id, month] of Object.entries(
                    data.updated.months
                  ) as [MonthId, MonthBranded][]) {
                    draft.months[id] = month;
                  }
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
  useCreateCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
  useDeleteCategoryGroupMutation,
} = categoryGroupApiSlice;
