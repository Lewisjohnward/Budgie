import { login, registerUser } from "../utils/auth";
import { getAppSnapshot, getAppSnapshotBody } from "../utils/appSnapshot";
import { BudgetHydrationModel } from "../../features/budget/queries/hydration/hydration.types";

describe("Snapshot", () => {
  let cookie: string;
  let snapshot: BudgetHydrationModel;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    snapshot = await getAppSnapshotBody(cookie);
  });

  describe("Success", () => {
    it("Should return 200 get snapshot", async () => {
      const res = await getAppSnapshot(cookie);
      expect(res.statusCode).toBe(200);
    });
    it("Should return a valid snapshot", async () => {
      expect(snapshot).toMatchObject({
        categoryGroups: expect.any(Object),
        categories: expect.any(Object),
        months: expect.any(Object),
        accounts: expect.any(Object),
        transactions: expect.any(Object),
        payees: expect.any(Object),
        memosByMonth: expect.any(Object),
        monthKeys: expect.any(Array),
      });
    });
    it("MonthKeys should match memosByMonth keys", async () => {
      const memoKeys = Object.keys(snapshot.memosByMonth).sort();
      const monthKeys = [...snapshot.monthKeys].sort();

      expect(monthKeys).toEqual(memoKeys);
    });
    it("MonthKeys should be YYYY-MM formatted", async () => {
      const isValid = snapshot.monthKeys.every((m) => /^\d{4}-\d{2}$/.test(m));

      expect(isValid).toBe(true);
    });
    it("Should not contain duplicate month keys", async () => {
      const unique = new Set(snapshot.monthKeys);

      expect(unique.size).toBe(snapshot.monthKeys.length);
    });
  });
});
