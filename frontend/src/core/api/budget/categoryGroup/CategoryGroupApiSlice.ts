import { CategoryGroupId } from "@/pages/budget/allocation/types/types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import { CategoryGroupBranded } from "@/core/types/NormalizedData";

type UpdatedCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
  name?: string;
  position?: number;
};

export const categoryGroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateCategoryGroup: builder.mutation<
      CategoryGroupBranded,
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

              const fromPos = moved.position;
              const toPos = arg.position;

              if (typeof toPos !== "number" || toPos === fromPos) return;

              // Convert object map → array for ordering
              const list = Object.values(groups);

              // remove moved group from list
              const without = list.filter((g) => g.id !== arg.categoryGroupId);

              // insert at new position
              without.splice(toPos, 0, moved);

              // normalize positions
              without.forEach((g, index) => {
                g.position = index;
              });

              // write back into normalized map
              draft.categoryGroups.user = Object.fromEntries(
                without.map((g) => [g.id, g])
              );
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

export const { useUpdateCategoryGroupMutation } = categoryGroupApiSlice;
