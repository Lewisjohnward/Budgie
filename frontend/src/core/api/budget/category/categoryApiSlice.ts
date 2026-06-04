import {
  CategoryGroupId,
  CategoryId,
} from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import { CategoryBranded, MonthBranded } from "@/core/types/NormalizedData";

const CATEGORY_ENDPOINT_URL = "budget/categories";

// Input to update category
type UpdateCategoryInput = {
  categoryId: CategoryId;
  name?: string;
  categoryGroupId?: CategoryGroupId;
  position?: number;
};

// Input to create category
type CreateCategoryInput = {
  name: string;
  categoryGroupId: CategoryGroupId;
};

// Response to update category
type UpdatedCategoryDto = CategoryBranded;
// Response to create category
type CreatedCategoryDto = {
  created: {
    category: CategoryBranded;
    months: Record<string, MonthBranded>;
  };
};

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<CreatedCategoryDto, CreateCategoryInput>({
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
    updateCategory: builder.mutation<UpdatedCategoryDto, UpdateCategoryInput>({
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
    deleteCategory: builder.mutation<void, { categoryId: string }>({
      query: (categoryId) => {
        return {
          url: CATEGORY_ENDPOINT_URL,
          method: "DELETE",
          body: categoryId,
        };
      },
      invalidatesTags: ["Categories", "Accounts"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
