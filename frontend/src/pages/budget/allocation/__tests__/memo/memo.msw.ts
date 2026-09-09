import { http, HttpResponse } from "msw";
import { getSnapshot } from "../__helpers__/msw/state";
import {
  ApiBudgetSnapshot,
  EditMemoRequest,
  EditMemoResponse,
} from "@/core/types/exported-types";

const API_URL = import.meta.env.VITE_API_URL;

export const editMemoHandler = http.patch(
  `${API_URL}/budget/memo/:id`,
  async ({ params, request }) => {
    const memoId = params.id;
    if (typeof memoId !== "string") {
      throw new Error("id is not a string");
    }

    const body = (await request.json().catch(() => ({}))) as EditMemoRequest;

    const snapshot = getSnapshot();

    const res = editMemoResult(snapshot, memoId, body.content);

    return HttpResponse.json(res);
  }
);

export function editMemoResult(
  snapshot: ApiBudgetSnapshot,
  id: string,
  content: string
): EditMemoResponse {
  const memo = Object.values(snapshot.memosByMonth).find(
    (memo) => memo.id === id
  );

  if (!memo) {
    throw new Error(`Memo with id "${id}" not found`);
  }

  return {
    ...memo,
    content,
  };
}

export const editMemoFailureHandler = http.patch(
  `${API_URL}/budget/memo/:id`,
  () => {
    return HttpResponse.json(
      { message: "Failed to update memo" },
      { status: 500 }
    );
  }
);
