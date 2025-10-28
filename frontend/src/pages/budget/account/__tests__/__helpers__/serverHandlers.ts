import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { baseMockAccountData, baseMockCategoryData } from "./mockData";
import { NormalizedData } from "@/core/types/NormalizedData";
import { AllocationData } from "@/core/types/Allocation";

const API_URL = import.meta.env.VITE_API_URL;

export const addTransactionSpy = vi.fn();

type HandlerOptions = {
  accountData?: NormalizedData;
  categoryData?: AllocationData;
};

export const createHandlers = (options: HandlerOptions = {}) => {
  const accountData = options.accountData || baseMockAccountData;
  const categoryData = options.categoryData || baseMockCategoryData;

  return [
    http.get(`${API_URL}/budget/account`, () => {
      return HttpResponse.json(accountData);
    }),
    http.get(`${API_URL}/budget/category`, () => {
      return HttpResponse.json(categoryData);
    }),
    http.post(`${API_URL}/budget/transaction`, async ({ request }) => {
      const newTransaction = await request.json();
      addTransactionSpy(newTransaction);
      return HttpResponse.json(
        { ...newTransaction, id: "new-tx-id" },
        { status: 201 }
      );
    }),
    http.delete(`${API_URL}/budget/transaction`, () => {
      return HttpResponse.json({ status: "ok" });
    }),
    http.post(`${API_URL}/budget/transaction/duplicate`, () => {
      return HttpResponse.json({ status: "ok" });
    }),
  ];
};

export const setupTestServer = (options: HandlerOptions = {}) => {
  const server = setupServer(...createHandlers(options));

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    addTransactionSpy.mockClear();
  });
  afterAll(() => server.close());

  return server;
};
