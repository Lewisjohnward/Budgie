import {
  asCategoryGroupId,
  CategoryGroupId,
  MonthId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CategoryGroupBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";

type UpdatedCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
  name?: string;
  position?: number;
};

type CreateCategoryGroupInput = {
  name: string;
};

type DeleteCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
};

type CreateCategoryGroupDto = CategoryGroupBranded;
type UpdateCategoryGroupDto = CategoryGroupBranded;
type DeleteCategoryGroupDto = {
  deleted: {
    categoryGroupId: CategoryGroupId;
  };

  updated: {
    transactions: Record<string, TransactionBranded>;
    months: Record<string, MonthBranded>;
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
          url: "budget/categorygroups",
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
    deleteCategoryGroup: builder.mutation<
      DeleteCategoryGroupDto,
      DeleteCategoryGroupInput
    >({
      query: ({ categoryGroupId }) => ({
        url: `budget/categorygroups/${categoryGroupId}`,
        method: "DELETE",
        body: {},
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistic update (remove + reorder)
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
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
    updateCategoryGroup: builder.mutation<
      UpdateCategoryGroupDto,
      UpdatedCategoryGroupInput
    >({
      query: ({ name, position, categoryGroupId }) => ({
        url: `budget/categorygroups/${categoryGroupId}`,
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
  }),
});

export const {
  useCreateCategoryGroupMutation,
  useDeleteCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
} = categoryGroupApiSlice;
