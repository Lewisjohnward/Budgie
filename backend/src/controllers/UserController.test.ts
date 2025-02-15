import app from "../app";
import request from "supertest";

import {
  createUser,
  GenerateAccessToken,
  GenerateRefreshToken,
  getUser,
  updateRefreshToken,
  userExists,
  ValidatePassword,
} from "../utility";

jest.mock("../utility/", () => ({
  ...jest.requireActual("../utility"),
  // Register
  userExists: jest.fn(),
  createUser: jest.fn(),
  initialiseCategories: jest.fn(),

  // Login
  getUser: jest.fn(),
  ValidatePassword: jest.fn(),
  GenerateAccessToken: jest.fn(),
  GenerateRefreshToken: jest.fn(),
  updateRefreshToken: jest.fn(),
}));

describe("User Controller", () => {
  describe("Register", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("Should return 400 if either email or password are missing", async () => {
      const noEmailReponse = await request(app)
        .post("/user/register")
        .send({ password: "abcdefgG8£" })
        .set("Authorization", "Bearer mock-token");

      expect(noEmailReponse.status).toBe(400);

      const noPasswordReponse = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com" })
        .set("Authorization", "Bearer mock-token");

      expect(noPasswordReponse.status).toBe(400);
    });

    it("Should return 400 if both email and password are missing", async () => {
      const response = await request(app)
        .post("/user/register")
        .send({})
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
    });

    it("Should return 422 if credentials validation fails", async () => {
      const response = await request(app)
        .post("/user/register")
        .send({ email: "test", password: "test" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(422);
    });

    it("Should return 400 if the user already exists", async () => {
      (userExists as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "abdegh745K!k" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
    });

    it("Should return 500 if unable to create user", async () => {
      (createUser as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test placeholder");
      });

      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "abdegh745K!a" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(500);
    });

    it("Should return 200 and register user", async () => {
      (createUser as jest.Mock).mockReturnValue({ id: "test" });
      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "abdegh745K!a" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(200);
    });
  });

  describe("Login", () => {
    it("Should return 400 if both email and password are missing", async () => {
      const response = await request(app)
        .post("/user/register")
        .send({})
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
    });

    it("Should return 400 if either email or password are missing", async () => {
      const noEmailReponse = await request(app)
        .post("/user/register")
        .send({ password: "abcdefgG8£" })
        .set("Authorization", "Bearer mock-token");

      const noPasswordReponse = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com" })
        .set("Authorization", "Bearer mock-token");

      expect(noEmailReponse.status).toBe(400);
      expect(noPasswordReponse.status).toBe(400);
    });

    it("should return 400 if user does not exist", async () => {
      (getUser as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/user/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("There has been an error logging in");
    });

    it("should return 400 if password is invalid", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
        salt: "salt",
      };
      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (ValidatePassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post("/user/login")
        .send({ email: "test@example.com", password: "wrongPassword" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("There has been an error logging in");
    });

    it("should return 200 and access token on successful login", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
        salt: "salt",
        id: "userId",
      };
      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (ValidatePassword as jest.Mock).mockResolvedValue(true);
      (GenerateAccessToken as jest.Mock).mockReturnValue("accessToken");
      (GenerateRefreshToken as jest.Mock).mockReturnValue("refreshToken");
      updateRefreshToken as jest.Mock;

      const response = await request(app)
        .post("/user/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(200);
      expect(response.body).toBe("accessToken");
      expect(response.headers["set-cookie"][0]).toContain("jwt=refreshToken");
    });
  });
});
