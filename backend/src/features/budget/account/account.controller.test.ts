import request from "supertest";
import app from "../../../app";
import { initialiseAccount, selectAccounts } from "../../../utility";

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
    initialiseAccount: jest.fn(),
    selectAccounts: jest.fn(),
  };
});

const mockId = "dbfbbeb4-89d9-4b08-b627-1be5b4748107";

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

  it("should validate input and create an account even with zero balance", async () => {
    const mockData = {
      name: "Personal Bank Account",
      type: "BANK",
      balance: 0,
    };

    console.log("MOCK DATA", mockData);

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
    const response = await request(app).get("/budget/accounts");
    expect(response.status).toBe(500);
  });

  it("Should return 200 if there is no error", async () => {
    const selectAccountsMock = selectAccounts as jest.Mock;
    selectAccountsMock.mockResolvedValue([]);

    const response = await request(app).get("/budget/accounts");

    expect(response.status).toBe(200);
  });
});
