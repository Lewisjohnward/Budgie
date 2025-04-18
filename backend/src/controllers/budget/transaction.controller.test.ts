import request from "supertest";
import app from "../../app";
import { editTransactionArraySchema } from "../../schemas";
import {
  deleteTransactions,
  insertTransaction,
  selectAccounts,
  updateTransactions,
  userOwnsAccount,
  ValidateSignature,
} from "../../utility";
const mockId = "dbfbbeb4-89d9-4b08-b627-1be5b4748107";

jest.mock("../../utility", () => {
  const actualModule = jest.requireActual("../../utility");
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
describe("Transaction controller", () => {
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
        inflow: "120",
      });
      expect(response.status).toBe(503);
      (insertTransaction as jest.Mock).mockReset();
    });

    it("Should return 200 if correct data sent", async () => {
      (userOwnsAccount as jest.Mock).mockReturnValue(null);

      const response = await request(app).post("/budget/transaction").send({
        accountId: "7c5a7df3-bd02-4576-b9e5-c2c8d6cf4d21",
        categoryId: "7c5a7df3-bd02-4576-b9e5-c2c8d6cf4d21",
        inflow: "120",
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
        .mockReturnValueOnce([{ id: "1" }]);

      (updateTransactions as jest.Mock).mockRejectedValueOnce(
        new Error("Mock db error"),
      );

      const response = await request(app).patch("/budget/transaction").send();

      expect(response.statusCode).toBe(500);
    });

    it("Should return 200 when transaction is edited success", async () => {
      jest
        .spyOn(editTransactionArraySchema, "parse")
        .mockReturnValueOnce([{ id: "1" }]);

      const response = await request(app).patch("/budget/transaction").send();

      expect(response.statusCode).toBe(200);
    });
  });
});
