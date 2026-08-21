import {
  asCategoryGroupId,
  asCategoryId,
  asMonthId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import { UpdatedMonthsById } from "@/core/schemas/editMonthSchema";
import { UpdateMonthsPayload } from "@/pages/budget/allocation/components/assign/types/assignTypes";
import {
  CreateCategoryResponse,
  DeleteCategoryResponse,
  UpdateCategoryResponse,
} from "@/core/types/exported-types";
import { mapCategory } from "../mappers/categoryMapper";
import { mapMonth } from "../mappers/monthMapper";
import {
  CreateCategoryInput,
  CreateCategoryResult,
  DeleteCategoryInput,
  DeleteCategoryResult,
  UpdateCategoryInput,
  UpdateCategoryResult,
} from "./types";
import { mapTransaction } from "../mappers/transactionMapper";

const CATEGORY_ENDPOINT_URL = "budget/categories";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<CreateCategoryResult, CreateCategoryInput>(
      {
        query: (category) => ({
          url: CATEGORY_ENDPOINT_URL,
          method: "POST",
          body: category,
        }),
        transformResponse: (
          response: CreateCategoryResponse
        ): CreateCategoryResult => ({
          created: {
            category: mapCategory(response.created.category),
            months: Object.fromEntries(
              Object.entries(response.created.months).map(([id, month]) => [
                asMonthId(id),
                mapMonth(month),
              ])
            ),
          },
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
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
      }
    ),
    updateCategory: builder.mutation<UpdateCategoryResult, UpdateCategoryInput>(
      {
        query: ({ categoryId, name, position, categoryGroupId }) => ({
          url: `${CATEGORY_ENDPOINT_URL}/${categoryId}`,
          method: "PATCH",
          body: { name, position, categoryGroupId },
        }),
        transformResponse: (
          response: UpdateCategoryResponse
        ): UpdateCategoryResult => ({
          updated: {
            category: mapCategory(response.updated.category),
            categories: response.updated.categories.map((p) => ({
              id: asCategoryId(p.id),
              position: p.position,
              categoryGroupId: asCategoryGroupId(p.categoryGroupId),
            })),
          },
        }),

        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          // const patchResult = dispatch(
          //   budgetSnapshotSlice.util.updateQueryData(
          //     "getBudgetSnapshot",
          //     undefined,
          //     (draft) => {
          //       const categories = draft.categories.user;
          //
          //       const moved = categories[arg.categoryId];
          //       if (!moved) return;
          //
          //       const fromGroup = moved.categoryGroupId;
          //       const toGroup = arg.categoryGroupId ?? fromGroup;
          //       const toPos = arg.position ?? moved.position;
          //
          //       // Only perform the repositioning logic when the category
          //       // is actually being moved.
          //       if (
          //         arg.position !== undefined ||
          //         arg.categoryGroupId !== undefined
          //       ) {
          //         // Group categories into arrays
          //         const groups: Record<string, CategoryUserBranded[]> = {};
          //
          //         Object.values(categories).forEach((category) => {
          //           const group = category.categoryGroupId;
          //
          //           if (!groups[group]) {
          //             groups[group] = [];
          //           }
          //
          //           groups[group].push(category);
          //         });
          //
          //         // Sort each group by position
          //         Object.values(groups).forEach((group) => {
          //           group.sort((a, b) => a.position - b.position);
          //         });
          //
          //         // Remove from old group
          //         const fromList = groups[fromGroup];
          //
          //         const index = fromList.findIndex(
          //           (category) => category.id === moved.id
          //         );
          //
          //         if (index !== -1) {
          //           const [removed] = fromList.splice(index, 1);
          //
          //           // Insert into new group
          //           const toList = groups[toGroup] ?? [];
          //           groups[toGroup] = toList;
          //
          //           toList.splice(toPos, 0, removed);
          //
          //           // Normalise all groups
          //           Object.values(groups).forEach((group) => {
          //             group.forEach((category, index) => {
          //               category.position = index;
          //
          //               if (group === toList) {
          //                 category.categoryGroupId = toGroup;
          //               }
          //             });
          //           });
          //         }
          //       }
          //
          //       // Optimistically update name
          //       if (arg.name !== undefined) {
          //         moved.name = arg.name;
          //       }
          //     }
          //   )
          // );

          try {
            const { data } = await queryFulfilled;

            dispatch(
              budgetSnapshotSlice.util.updateQueryData(
                "getBudgetSnapshot",
                undefined,
                (draft) => {
                  const { category, categories } = data.updated;

                  // Updated
                  draft.categories.user[category.id] = category;

                  // Apply any position/category-group
                  for (const categoryPatch of categories) {
                    const existing = draft.categories.user[categoryPatch.id];

                    if (!existing) continue;

                    existing.position = categoryPatch.position;
                    existing.categoryGroupId = categoryPatch.categoryGroupId;
                  }
                }
              )
            );
          } catch {
            // patchResult.undo();
          }
        },
      }
    ),
    deleteCategory: builder.mutation<DeleteCategoryResult, DeleteCategoryInput>(
      {
        query: ({ categoryId, inheritingCategoryId }) => ({
          url: `${CATEGORY_ENDPOINT_URL}/${categoryId}`,
          method: "DELETE",
          body: inheritingCategoryId ? { inheritingCategoryId } : undefined,
        }),

        transformResponse: (
          response: DeleteCategoryResponse
        ): DeleteCategoryResult => ({
          deleted: {
            category: mapCategory(response.deleted.category),

            months: Object.fromEntries(
              Object.entries(response.deleted.months).map(([id, month]) => [
                asMonthId(id),
                mapMonth(month),
              ])
            ),
          },

          updated: {
            categories: response.updated.categories.map((category) => ({
              id: asCategoryId(category.id),
              position: category.position,
              categoryGroupId: asCategoryGroupId(category.categoryGroupId),
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
                  for (const patch of data.updated.categories) {
                    const category = draft.categories.user[patch.id];

                    if (!category) continue;

                    category.position = patch.position;
                    category.categoryGroupId = patch.categoryGroupId;
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
      }
    ),
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
                draft.months[asMonthId(id)] = mapMonth(month);
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
