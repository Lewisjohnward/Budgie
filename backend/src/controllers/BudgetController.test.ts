import request from "supertest";
import app from "../app"; // Import your app
import {
  deleteTransactions,
  initialiseAccount,
  insertTransaction,
  selectAccounts,
  updateTransactions,
  userOwnsAccount,
} from "../utility";
import { editTransactionArraySchema } from "../schemas";

jest.mock("@prisma/client", () => {
  const actualPrisma = jest.requireActual("@prisma/client");
  return {
    ...actualPrisma,
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
      },
      account: {
        create: jest.fn(() => {
          console.log("IM BEING CALLED");
          return "hello";
        }),
      },
    })),
  };
});

const mockId = "dbfbbeb4-89d9-4b08-b627-1be5b4748107";

jest.mock("../utility", () => {
  const actualModule = jest.requireActual("../utility");
  return {
    ...actualModule,
    ValidateSignature: jest.fn((req) => {
      req.user = {
        _id: mockId,
        email: "test@test.com",
      };
      return true;
    }),
    insertTransaction: jest.fn(),
    userOwnsAccount: jest.fn(),
    selectAccounts: jest.fn(),
    normalizeData: jest.fn(),
    initialiseAccount: jest.fn(),
    deleteTransactions: jest.fn(),
    updateTransactions: jest.fn(),
  };
});

describe("Budget Controller", () => {
  describe("Add account", () => {
    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/budget/account")
        .send({})
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Malformed data");
    });

    it("should return 400 for missing type or balance", async () => {
      const response = await request(app)
        .post("/budget/account")
        .send({
          name: "Personal Account",
        })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Malformed data");
    });

    it("should return 400 for invalid type", async () => {
      const response = await request(app)
        .post("/budget/account")
        .send({
          name: "Invalid Type Account",
          type: "INVALID_TYPE",
          balance: 1000.0,
        })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Malformed data");
    });

    it("should validate input and create an account", async () => {
      const mockData = {
        name: "Personal Bank Account",
        type: "BANK",
        balance: 1000.0,
      };

      const response = await request(app)
        .post("/budget/account")
        .send(mockData)
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(200);
      expect(initialiseAccount as jest.Mock).toHaveBeenCalledTimes(1);
      expect(initialiseAccount as jest.Mock).toHaveBeenCalledWith({
        userId: mockId,
        ...mockData,
      });
      expect(response.body).toEqual({ message: "Account added" });
    });
  });

  describe("getAccounts", () => {
    it("Should return 500 if there is an error", async () => {
      (selectAccounts as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      const response = await request(app).get("/budget/account");
      expect(response.status).toBe(500);
    });

    it("Should return 200 if there is no error", async () => {
      const selectAccountsMock = selectAccounts as jest.Mock;
      selectAccountsMock.mockResolvedValue([]);

      const response = await request(app).get("/budget/account");

      expect(response.status).toBe(200);
    });
  });

  describe("Add transaction", () => {
    it("Should return 400 when both inflow and outflow missing", async () => {
      const response = await request(app)
        .post("/budget/transaction")
        .send({ date: "10-10-2024" });

      expect(response.status).toBe(400);
    });

    it("Should return 400 when both inflow and outflow provided", async () => {
      const response = await request(app)
        .post("/budget/transaction")
        .send({ date: "10-10-2024", inflow: 50, outflow: 200 });

      expect(response.status).toBe(400);
    });

    it("Should return 400 if transactionSchema validation fails", async () => {
      const response = await request(app).post("/budget/transaction").send({
        inflow: "not-a-number",
      });
      expect(response.status).toBe(400);
    });

    it("Should return 503 if insertion in db fails", async () => {
      (insertTransaction as jest.Mock).mockRejectedValue("Failed");

      const response = await request(app).post("/budget/transaction").send({
        accountId: "7c5a7df3-bd02-4576-b9e5-c2c8d6cf4d21",
        categoryId: "7c5a7df3-bd02-4576-b9e5-c2c8d6cf4d21",
        inflow: 120,
      });
      expect(response.status).toBe(503);
      (insertTransaction as jest.Mock).mockReset();
    });

    it("Should return 200 if correct data sent", async () => {
      (userOwnsAccount as jest.Mock).mockReturnValue(null);

      const response = await request(app).post("/budget/transaction").send({
        accountId: "7c5a7df3-bd02-4576-b9e5-c2c8d6cf4d21",
        categoryId: "7c5a7df3-bd02-4576-b9e5-c2c8d6cf4d21",
        inflow: 120,
      });
      expect(response.status).toBe(200);
      expect(insertTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteTransaction", () => {
    it("Should return 400 when no transcationId[] is provided", async () => {
      const response = await request(app)
        .delete("/budget/transaction")
        .send({ userId: "test-id" });

      expect(response.status).toBe(400);
      expect.hasAssertions();
    });

    it("Should return 400 when empty transcationId[] is provided", async () => {
      const response = await request(app)
        .delete("/budget/transaction")
        .send({ userId: "test-id", transactionIds: [] });

      expect(response.status).toBe(400);
      expect.hasAssertions();
    });

    it("Should return 500 when db throws an error", async () => {
      (deleteTransactions as jest.Mock).mockRejectedValueOnce(
        new Error("DB failed error"),
      );

      const response = await request(app)
        .delete("/budget/transaction")
        .send({ transactionIds: ["test-id"] });

      expect(response.status).toBe(500);
    });

    it("Should return 200 when transaction delete success", async () => {
      const response = await request(app)
        .delete("/budget/transaction")
        .send({ transactionIds: ["test-id"] });

      expect(response.status).toBe(200);
    });
  });

  describe("editTransaction", () => {
    it("Should return 400 when data malformed", async () => {
      const response = await request(app)
        .patch("/budget/transaction")
        .send([
          {
            transactionId: "Not uuid",
          },
        ]);

      expect(response.status).toBe(400);
    });

    it("Should return 500 if db throws error", async () => {
      jest
        .spyOn(editTransactionArraySchema, "parse")
        .mockReturnValueOnce([{ transactionId: "1" }]);

      (updateTransactions as jest.Mock).mockRejectedValueOnce(
        new Error("Mock db error"),
      );

      const response = await request(app).patch("/budget/transaction").send();

      expect(response.statusCode).toBe(500);
    });

    it("Should return 200 when transaction is edited success", async () => {
      jest
        .spyOn(editTransactionArraySchema, "parse")
        .mockReturnValueOnce([{ transactionId: "1" }]);

      const response = await request(app).patch("/budget/transaction").send();

      expect(response.statusCode).toBe(200);
    });
  });
});
