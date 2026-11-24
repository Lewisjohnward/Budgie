import { http, HttpResponse } from "msw";
import { createStore } from "@/core/store/store";
import {
  ApiBudgetSnapshot,
  CreateAccountResponse,
} from "@/core/types/exported-types";

import { budgetSnapshotSlice } from "../budgetSnapshotSlice";

import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
  accountIds,
} from "@/pages/budget/allocation/__tests__/fixtures/ids";

import { createMonth } from "@/pages/budget/allocation/__tests__/utils/createMonth";
import { createAccount } from "@/pages/budget/allocation/__tests__/utils/entities/createAccount";
import {
  createUserCategory,
  createSystemCategory,
} from "@/pages/budget/allocation/__tests__/utils/entities/createCategory";
import {
  createUserCategoryGroup,
  createSystemCategoryGroup,
} from "@/pages/budget/allocation/__tests__/utils/entities/createCategoryGroup";
import { createMemo } from "@/pages/budget/allocation/__tests__/utils/entities/createMemo";
import { defaultMonth } from "@/pages/budget/allocation/__tests__/utils/entities/defaults";
import {
  server,
  setupTestServer,
} from "@/pages/budget/account/__tests__/__helpers__/msw/server";
import { accountApiSlice } from "./accountApiSlice";
import { setSnapshot } from "@/pages/budget/account/__tests__/__helpers__/msw/state";
import { asAccountId } from "@/pages/budget/allocation/types/types";

describe("accountApiSlice", () => {
  setupTestServer();
  const monthKey = defaultMonth;

  const baseSnapshot: ApiBudgetSnapshot = {
    categories: {
      user: {
        [categoryIds.groceries]: createUserCategory(
          categoryIds.groceries,
          categoryGroupIds.important,
          { name: "Groceries" }
        ),
      },
      rta: createSystemCategory(categoryIds.rta, categoryGroupIds.inflow),
      uncategorised: createSystemCategory(
        categoryIds.uncategorised,
        categoryGroupIds.uncategorised
      ),
    },
    categoryGroups: {
      user: {
        [categoryGroupIds.important]: createUserCategoryGroup(
          categoryGroupIds.important,
          { name: "Important" }
        ),
      },
      inflow: createSystemCategoryGroup(categoryGroupIds.inflow),
      uncategorised: createSystemCategoryGroup(categoryGroupIds.uncategorised),
    },
    months: {
      [monthIds.rtaM1]: createMonth(monthIds.rtaM1, categoryIds.rta),
      [monthIds.uncategorisedM1]: createMonth(
        monthIds.uncategorisedM1,
        categoryIds.uncategorised
      ),
      [monthIds.groceriesM1]: createMonth(
        monthIds.groceriesM1,
        categoryIds.groceries
      ),
    },
    monthKeys: [monthKey],
    accounts: {
      [accountIds.checking]: createAccount(accountIds.checking, {
        balance: 0,
      }),
    },
    transactions: {},
    payees: {},
    memosByMonth: {
      [monthKey]: createMemo(memoIds.memoM1),
    },
  };

  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    setSnapshot(baseSnapshot);
  });

  const seedSnapshot = async () => {
    await store.dispatch(
      budgetSnapshotSlice.util.upsertQueryData(
        "getBudgetSnapshot",
        undefined,
        baseSnapshot as unknown as any
      )
    );
  };

  const getSnapshot = () => {
    const result = budgetSnapshotSlice.endpoints.getBudgetSnapshot.select()(
      store.getState()
    );

    if (!result.data) {
      throw new Error("Budget snapshot is not in the cache");
    }

    return result.data;
  };

  describe("addAccount", () => {
    it("optimistically adds an account before the API responds", async () => {
      await seedSnapshot();

      let resolveRequest!: () => void;
      let requestStarted!: () => void;

      const requestIsStarted = new Promise<void>((resolve) => {
        requestStarted = resolve;
      });

      server.use(
        http.post("*/budget/account", async () => {
          requestStarted();

          await new Promise<void>((resolve) => {
            resolveRequest = resolve;
          });

          const response: CreateAccountResponse = {
            created: {
              account: {
                id: "test",
                name: "test",
                position: 1,
                open: true,
                type: "BANK",
                deletable: true,
                balance: 0,
              },
            },
            updated: {
              months: {},
            },
          };

          return HttpResponse.json(response);
        })
      );

      const mutation = store.dispatch(
        accountApiSlice.endpoints.addAccount.initiate({
          name: "Monzo",
          type: "BANK",
          balance: 250,
        })
      );

      try {
        await requestIsStarted;

        const accounts = Object.values(getSnapshot().accounts);

        expect(accounts).toHaveLength(2);
        expect(accounts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: "Monzo",
              balance: 250,
              type: "BANK",
            }),
          ])
        );
        expect(Object.values(getSnapshot().accounts)).toHaveLength(2);
      } finally {
        resolveRequest?.();
        await mutation;
      }
    });

    it("replaces the optimistic account with the server response", async () => {
      await seedSnapshot();

      const serverAccountId = "server-account-id";

      const createAccountResponse: CreateAccountResponse = {
        created: {
          account: {
            id: serverAccountId,
            name: "Monzo",
            position: 1,
            open: true,
            type: "BANK",
            deletable: true,
            balance: 250,
          },
        },
        updated: {
          months: {},
        },
      };

      server.use(
        http.post("*/budget/account", () =>
          HttpResponse.json(createAccountResponse)
        )
      );

      const result = await store.dispatch(
        accountApiSlice.endpoints.addAccount.initiate({
          name: "Monzo",
          type: "BANK",
          balance: 250,
        })
      );

      expect(result).toHaveProperty("data");

      await vi.waitFor(() => {
        expect(Object.keys(getSnapshot().accounts).sort()).toEqual(
          [accountIds.checking, serverAccountId].sort()
        );
      });

      expect(getSnapshot().accounts[asAccountId(serverAccountId)]).toEqual(
        expect.objectContaining({
          id: serverAccountId,
          name: "Monzo",
          balance: 250,
          type: "BANK",
        })
      );

      expect(getSnapshot().accounts[asAccountId(accountIds.checking)]).toEqual(
        baseSnapshot.accounts[accountIds.checking]
      );
    });

    it("rolls back the optimistic account when the request fails", async () => {
      await seedSnapshot();

      server.use(
        http.post("*/budget/account", () =>
          HttpResponse.json({ message: "Request failed" }, { status: 500 })
        )
      );

      const result = await store.dispatch(
        accountApiSlice.endpoints.addAccount.initiate({
          name: "Monzo",
          type: "BANK",
          balance: 250,
        })
      );

      expect(result).toHaveProperty("error");

      await vi.waitFor(() => {
        expect(Object.keys(getSnapshot().accounts)).toEqual([
          accountIds.checking,
        ]);
      });

      expect(getSnapshot().accounts[asAccountId(accountIds.checking)]).toEqual(
        baseSnapshot.accounts[accountIds.checking]
      );
    });

    it("merges the created transaction and updated months from the response", async () => {
      await seedSnapshot();

      const updatedMonth = {
        ...baseSnapshot.months[monthIds.rtaM1],
      };

      server.use(
        http.post("*/budget/account", () =>
          HttpResponse.json({
            created: { account: serverAccount, transaction: serverTransaction },
            updated: { months: { [monthIds.rtaM1]: updatedMonth } },
          })
        )
      );

      await store.dispatch(
        accountApiSlice.endpoints.addAccount.initiate(input)
      );

      await vi.waitFor(() => {
        expect(getSnapshot().transactions[serverTransaction.id]).toBeDefined();
      });
      expect(getSnapshot().months[monthIds.rtaM1]).toEqual(
        /* mapped updatedMonth */
      );
    });
  });
});
