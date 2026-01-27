import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import request from "supertest";
import app from "../../app";
import { getCategories } from "../utils/getData";
import { LENGTH_ON_SIGNUP } from "../utils/memo";
import { login } from "../utils/auth";

const prisma = new PrismaClient();

describe("Auth Controller", () => {
  describe("Register", () => {
    const testEmail = "test@example.com";
    const testPassword = "ValidPass123!";
    let testUserId: string;

    describe("Error Cases", () => {
      it("should return 400 if email is missing", async () => {
        const response = await request(app).post("/user/autħ/register").send({
          password: testPassword,
        });

        expect(response.status).toBe(400);
      });

      it("should return 400 if password is missing", async () => {
        const response = await request(app).post("/user/auth/register").send({
          email: testEmail,
        });

        expect(response.status).toBe(400);
      });

      it("should return 401 if email is invalid", async () => {
        const response = await request(app).post("/user/auth/register").send({
          email: "invalid-email",
          password: testPassword,
        });

        expect(response.status).toBe(401);
      });

      it("should return 400 if email is already registered", async () => {
        await request(app).post("/user/auth/register").send({
          email: testEmail,
          password: testPassword,
        });

        const response = await request(app).post("/user/auth/register").send({
          email: testEmail,
          password: "AnotherPassword123!",
        });

        expect(response.status).toBe(400);
      });
    });

    describe("Success", () => {
      it("should register a new user successfully", async () => {
        const response = await request(app).post("/user/auth/register").send({
          email: testEmail,
          password: testPassword,
        });

        expect(response.status).toBe(200);

        const user = await prisma.user.findUnique({
          where: { email: testEmail },
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(testEmail);
        expect(user?.salt).toBeDefined();
        const isPasswordValid = await bcrypt.compare(
          testPassword,
          user?.password || ""
        );
        expect(isPasswordValid).toBe(true);
      });
    });

    describe("InitialiseUser", () => {
      it("should create default categories for new users", async () => {
        await request(app).post("/user/auth/register").send({
          email: testEmail,
          password: testPassword,
        });

        const user = await prisma.user.findUnique({
          where: { email: testEmail },
        });
        if (!user) {
          expect(user).toBeDefined();
          throw new Error("User not created");
        }

        testUserId = user.id;
        const categories = await prisma.category.findMany({
          where: { userId: user.id },
        });
        expect(categories.length).toBeGreaterThan(0);
      });
      it("Should have a memo month entry for each month on signup", async () => {
        await request(app).post("/user/auth/register").send({
          email: testEmail,
          password: testPassword,
        });

        const cookie = await login({
          email: testEmail,
          password: testPassword,
        });

        const { months, memoByMonth, monthKeys } = await getCategories(cookie);

        expect(monthKeys.length).toBeGreaterThan(0);

        for (const key of monthKeys) {
          const memo = memoByMonth[key];

          expect(memo).toBeDefined();
          expect(memo.id).toEqual(expect.any(String));
          expect(memo.content).toEqual(expect.any(String));

          expect(memo.month.slice(0, 7)).toBe(key);
        }

        expect(Object.keys(memoByMonth).sort()).toEqual([...monthKeys].sort());

        const monthKeysFromMonths = [
          ...new Set(
            Object.values(months).map((m: any) => m.month.slice(0, 7))
          ),
        ].sort();

        expect([...monthKeys].sort()).toEqual(monthKeysFromMonths);
        expect(Object.keys(memoByMonth)).toHaveLength(LENGTH_ON_SIGNUP);
      });
    });
  });

  describe("Login", () => {
    const testEmail = "test-login@example.com";
    const testPassword = "ValidPass123!";
    let testUserId: string;

    beforeEach(async () => {
      await request(app).post("/user/auth/register").send({
        email: testEmail,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      if (user) {
        testUserId = user.id;
      }
    });

    it("should return 200 and set refresh token cookie on successful login", async () => {
      const response = await request(app).post("/user/auth/login").send({
        email: testEmail,
        password: testPassword,
      });

      expect(response.status).toBe(200);

      const [refreshToken] = response.headers["set-cookie"];
      expect(refreshToken).toBeDefined();
      expect(refreshToken).toContain("jwt=");

      expect(typeof response.body).toBe("string");
      expect(response.body.split(".").length).toBe(3);
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/user/auth/login")
        .send({ password: testPassword });

      expect(response.status).toBe(400);
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/user/auth/login")
        .send({ email: testEmail });

      expect(response.status).toBe(400);
    });

    it("should return 401 if email is not registered", async () => {
      const response = await request(app).post("/user/auth/login").send({
        email: "nonexistent@example.com",
        password: testPassword,
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 if password is incorrect", async () => {
      const response = await request(app).post("/user/auth/login").send({
        email: testEmail,
        password: "WrongPassword123!",
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 if email is invalid", async () => {
      const response = await request(app).post("/user/auth/login").send({
        email: "invalid-email",
        password: testPassword,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Logout", () => {
    let testUserId: string;
    const testRefreshToken = "test-refresh-token";
    const clearCookie =
      "jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax";
    const testEmail = "test-logout@example.com";
    const testPassword = "ValidPass123!";

    beforeEach(async () => {
      await request(app).post("/user/auth/register").send({
        email: testEmail,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      if (user) {
        testUserId = user.id;
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: testRefreshToken },
        });
      }
    });

    it("should clear refresh token from database and clear cookie on successful logout", async () => {
      const response = await request(app)
        .post("/user/auth/logout")
        .set("Cookie", [`jwt=${testRefreshToken}`])
        .send();

      expect(response.status).toBe(204);

      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(user?.refreshToken).toBeNull();

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies).toContain(clearCookie);
    });

    it("should return 204 and clear cookie even if no refresh token in database", async () => {
      await prisma.user.update({
        where: { id: testUserId },
        data: { refreshToken: null },
      });

      const response = await request(app)
        .post("/user/auth/logout")
        .set("Cookie", [`jwt=${testRefreshToken}`])
        .send();

      expect(response.status).toBe(204);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies).toContain(clearCookie);
    });

    it("should return 204 even if no JWT cookie is present", async () => {
      const response = await request(app).post("/user/auth/logout").send();

      expect(response.status).toBe(204);
      expect(response.headers["set-cookie"]).toBeUndefined();
    });
  });

  describe("Refresh", () => {
    let testUserId: string;
    const testRefreshToken = "test-refresh-token";
    const testEmail = "test-refresh@example.com";
    const testPassword = "ValidPass123!";

    beforeEach(async () => {
      await request(app).post("/user/auth/register").send({
        email: testEmail,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      if (user) {
        testUserId = user.id;
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: testRefreshToken },
        });
      }
    });

    it("should return 401 if no refresh token cookie is present", async () => {
      const response = await request(app).get("/user/auth/refresh").send();

      expect(response.status).toBe(401);
    });

    it("should return 403 if refresh token is invalid", async () => {
      const response = await request(app)
        .get("/user/auth/refresh")
        .set("Cookie", [`jwt=invalid-token`])
        .send();

      expect(response.status).toBe(403);
    });

    it("should return 403 if user not found with the refresh token", async () => {
      await prisma.user.delete({
        where: { id: testUserId },
      });

      const response = await request(app)
        .get("/user/auth/refresh")
        .set("Cookie", [`jwt=${testRefreshToken}`])
        .send();

      expect(response.status).toBe(403);
    });

    it("should return 200 with new access token if refresh token is valid", async () => {
      const loginResponse = await request(app)
        .post("/user/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      const refreshToken = loginResponse.body;

      if (!refreshToken) {
        throw new Error("No refresh token cookie found in login response");
      }

      const refreshResponse = await request(app)
        .get("/user/auth/refresh")
        .set("Cookie", `jwt=${refreshToken}`)
        .send();

      expect(refreshResponse.status).toBe(200);

      expect(typeof refreshResponse.body).toBe("object");
      expect(refreshResponse.body.token.split(".").length).toBe(3);

      if (loginResponse.body) {
        expect(refreshResponse.body.token).not.toBe(loginResponse.body.token);
      }
    });
  });
});
