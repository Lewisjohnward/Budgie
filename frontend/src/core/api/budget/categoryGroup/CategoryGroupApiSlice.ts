import {
  asCategoryGroupId,
  asCategoryId,
  asMonthId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CreateCategoryGroupResponse,
  DeleteCategoryGroupResponse,
  UpdateCategoryGroupResponse,
} from "@/core/types/exported-types";
import { mapCategoryGroup } from "../mappers/categoryGroupMapper";
import {
  CreateCategoryGroupInput,
  CreateCategoryGroupResult,
  DeleteCategoryGroupInput,
  DeleteCategoryGroupResult,
  UpdateCategoryGroupInput,
  UpdateCategoryGroupResult,
} from "./types";
import { mapCategory } from "../mappers/categoryMapper";
import { mapMonth } from "../mappers/monthMapper";
import { mapTransaction } from "../mappers/transactionMapper";

const CATEGORY_GROUP_ENDPOINT_URL = "budget/category-groups";

export const categoryGroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategoryGroup: builder.mutation<
      CreateCategoryGroupResult,
      CreateCategoryGroupInput
    >({
      query: (categoryGroup) => {
        return {
          url: CATEGORY_GROUP_ENDPOINT_URL,
          method: "POST",
          body: categoryGroup,
        };
      },
      transformResponse: (
        response: CreateCategoryGroupResponse
      ): CreateCategoryGroupResult => ({
        created: {
          categoryGroup: mapCategoryGroup(response.created.categoryGroup),
        },
      }),
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
                const { categoryGroup } = data.created;

                delete draft.categoryGroups.user[tempId];

                draft.categoryGroups.user[categoryGroup.id] = categoryGroup;
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    updateCategoryGroup: builder.mutation<
      UpdateCategoryGroupResult,
      UpdateCategoryGroupInput
    >({
      query: ({ name, position, categoryGroupId }) => ({
        url: `${CATEGORY_GROUP_ENDPOINT_URL}/${categoryGroupId}`,
        method: "PATCH",
        body: { name, position },
      }),
      transformResponse: (
        response: UpdateCategoryGroupResponse
      ): UpdateCategoryGroupResult => ({
        updated: {
          categoryGroup: mapCategoryGroup(response.updated.categoryGroup),
          categoryGroups: response.updated.categoryGroups.map((p) => ({
            ...p,
            id: asCategoryGroupId(p.id),
          })),
        },
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
      DeleteCategoryGroupResult,
      DeleteCategoryGroupInput
    >({
      query: ({ categoryGroupId, inheritingCategoryId }) => ({
        url: `${CATEGORY_GROUP_ENDPOINT_URL}/${categoryGroupId}`,
        method: "DELETE",
        body: inheritingCategoryId ? { inheritingCategoryId } : undefined,
      }),
      transformResponse: (
        response: DeleteCategoryGroupResponse
      ): DeleteCategoryGroupResult => ({
        deleted: {
          categoryGroup: mapCategoryGroup(response.deleted.categoryGroup),

          categories: Object.fromEntries(
            Object.entries(response.deleted.categories).map(
              ([id, category]) => [asCategoryId(id), mapCategory(category)]
            )
          ),

          months: Object.fromEntries(
            Object.entries(response.deleted.months).map(([id, month]) => [
              asMonthId(id),
              mapMonth(month),
            ])
          ),
        },

        updated: {
          categoryGroups: response.updated.categoryGroups.map((patch) => ({
            id: asCategoryGroupId(patch.id),
            position: patch.position,
          })),

          transactions: Object.fromEntries(
            Object.entries(response.updated.transactions).map(
              ([id, transaction]) => [
                asTransactionId(id),
                mapTransaction(transaction),
              ]
            )
          ),

          months: Object.fromEntries(
            Object.entries(response.updated.months).map(([id, month]) => [
              asMonthId(id),
              mapMonth(month),
            ])
          ),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const group = draft.categoryGroups.user[arg.categoryGroupId];

              if (!group) return;

              const categoryIds = Object.values(draft.categories.user)
                .filter(
                  (category) => category.categoryGroupId === arg.categoryGroupId
                )
                .map((category) => category.id);

              const categoryIdSet = new Set(categoryIds);

              // Delete categories
              for (const categoryId of categoryIds) {
                delete draft.categories.user[categoryId];
              }

              // Delete category months
              for (const month of Object.values(draft.months)) {
                if (categoryIdSet.has(month.categoryId)) {
                  delete draft.months[month.id];
                }
              }

              // Delete category group
              delete draft.categoryGroups.user[arg.categoryGroupId];

              // Re-index remaining category groups
              const groups = Object.values(draft.categoryGroups.user).sort(
                (a, b) => a.position - b.position
              );

              groups.forEach((group, index) => {
                group.position = index;
              });

              draft.categoryGroups.user = Object.fromEntries(
                groups.map((group) => [group.id, group])
              );
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
                // Deleted categoryGroup
                delete draft.categoryGroups.user[data.deleted.categoryGroup.id];

                // Deleted categories
                for (const category of Object.values(data.deleted.categories)) {
                  delete draft.categories.user[category.id];
                }

                // Updated transactions
                for (const transaction of Object.values(
                  data.updated.transactions
                )) {
                  draft.transactions[transaction.id] = transaction;
                }

                // Updated category groups
                for (const patch of data.updated.categoryGroups) {
                  const group = draft.categoryGroups.user[patch.id];

                  if (!group) continue;

                  group.position = patch.position;
                }

                // Updated transactions
                for (const transaction of Object.values(
                  data.updated.transactions
                )) {
                  draft.transactions[transaction.id] = transaction;
                }

                // Updated months
                for (const month of Object.values(data.updated.months)) {
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
  useCreateCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
  useDeleteCategoryGroupMutation,
} = categoryGroupApiSlice;
