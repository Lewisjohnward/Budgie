import { CreateTransactionInput } from "@/core/api/budget/transaction/types";
import { http, HttpResponse } from "msw";
import { getSnapshot } from "../../__helpers__/msw/state";
import { calculateCreateTransactionResult } from "./selection.utils";

const API_URL = import.meta.env.VITE_API_URL;

export const createTransactionHandler = http.post(
  `${API_URL}/budget/transaction`,
  async ({ request }) => {
    const body = (await request.json()) as CreateTransactionInput;

    const snapshot = getSnapshot();

    const result = calculateCreateTransactionResult(snapshot, body);

    return HttpResponse.json(result, { status: 201 });
  }
);
