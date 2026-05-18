import { NoteBranded } from "@/core/types/NormalizedData";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import { MonthKey } from "@/pages/budget/allocation/types/types";

type UpdateNoteInput = { month: MonthKey; id: string; content: string };

// TODO:(lewis 2026-05-18 13:43) this should be called noteApiSlice
export const noteSnapshotSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateNote: builder.mutation<NoteBranded, UpdateNoteInput>({
      query: ({ id, content }) => ({
        url: `budget/memo/${id}`,
        method: "PATCH",
        body: { content },
      }),

      async onQueryStarted({ month, content }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const note = draft.notesByMonth[month];
              if (note) note.content = content;
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

export const { useUpdateNoteMutation } = noteSnapshotSlice;
