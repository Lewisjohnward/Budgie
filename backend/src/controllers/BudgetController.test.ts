import request from "supertest";
import app from "../app"; // Import your app
import { PrismaClient } from "@prisma/client"; // Added Prisma imports

jest.mock("../utility", () => ({
  ValidateSignature: jest.fn((req) => {
    req.user = {
      _id: "dbfbbeb4-89d9-4b08-b627-1be5b4748107",
      email: "test@test.com",
    };
    return true;
  }),
}));

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

const prisma = new PrismaClient();

describe("Budget Controller", () => {
  describe("add Account", () => {
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
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "mock-user-id",
      });

      (prisma.account.create as jest.Mock).mockResolvedValue({
        name: "Personal Bank Account",
        type: "BANK",
        balance: 1000.0,
      });

      const response = await request(app)
        .post("/budget/account")
        .send({
          name: "Personal Bank Account",
          type: "BANK",
          balance: 1000.0,
        })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Account added" });

      // TODO: get this working

      // Check that the account creation was called with the correct data
      // expect(prisma.account.create).toHaveBeenCalledTimes(1);
      // expect(prisma.account.create).toHaveBeenCalledWith({
      //   data: {
      //     name: "Personal Bank Account",
      //     type: "BANK",
      //     balance: 1000.0,
      //   },
      // });
    });
  });
});
