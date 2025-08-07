import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AllocationData } from "@/core/types/Allocation";
import { baseMockAccountData, baseMockAllocationData } from "./mockData";
import { NormalizedData } from "@/core/types/NormalizedData";

const API_URL = import.meta.env.VITE_API_URL;

export const patchMonthSpy = vi.fn();

export const createHandlers = (
  mockData: AllocationData = baseMockAllocationData,
  accountData: NormalizedData = baseMockAccountData
) => [
  http.get(`${API_URL}/budget/account`, () => {
    return HttpResponse.json(accountData);
  }),
  http.get(`${API_URL}/budget/category`, () => {
    return HttpResponse.json(mockData);
  }),
  http.patch(`${API_URL}/budget/assign`, async (req) => {
    patchMonthSpy(await req.request.json());
    return HttpResponse.json({ status: "ok" });
  }),
];

export const setupTestServer = (mockData?: AllocationData) => {
  const server = setupServer(...createHandlers(mockData));

  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
    patchMonthSpy.mockClear();
  });
  afterAll(() => {
    server.close();
  });

  return server;
};
