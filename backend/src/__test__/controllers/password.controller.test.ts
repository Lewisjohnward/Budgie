import request from "supertest";
import app from "../../app";
import { prisma } from "../../shared/prisma/client";

describe("Password Controller", () => {
  describe("Forgot Password", () => {
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

    it("should return success response for valid email", async () => {
      const res = await request(app)
        .post("/user/password/forgot-password")
        .send({ email: testEmail });

      expect(res.status).toBe(200);

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: testUserId,
          expiresAt: { gte: new Date() },
        },
      });

      expect(resetToken).toMatchObject({
        userId: testUserId,
        expiresAt: expect.any(Date),
      });

      const now = new Date();
      expect(resetToken?.expiresAt.getTime()).toBeGreaterThan(now.getTime());

      const allTokens = await prisma.passwordResetToken.findMany({
        where: { userId: testUserId },
      });
      expect(allTokens).toHaveLength(1);
    });

    it("Should only ever have one entry per email", async () => {
      await request(app)
        .post("/user/password/forgot-password")
        .send({ email: testEmail })
        .set("Authorization", "Bearer mock-token");

      await request(app)
        .post("/user/password/forgot-password")
        .send({ email: testEmail });

      const resetTokens = await prisma.passwordResetToken.findMany({
        where: {
          userId: testUserId,
        },
      });

      expect(resetTokens).toHaveLength(1);
    });

    it("should return 200 for non-existent email", async () => {
      const res = await request(app)
        .post("/user/password/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(res.status).toBe(200);
    });

    it("should return 400 for missing email in request", async () => {
      const res = await request(app)
        .post("/user/password/forgot-password")
        .send({});

      expect(res.status).toBe(400);
    });

    it("Should send a reset password email", async () => {
      expect.hasAssertions();
    });
  });

  describe("Reset Password", () => {
    it.todo("should handle missing token in request");
    it.todo("should handle missing password in request");
  });

  describe("Change Password", () => {
    const newPassword = "NewValidPass123!";
    const testPassword = "ValidPass123!";
    const testEmail = "test-login@example.com";
    let authToken: string;

    beforeEach(async () => {
      await request(app).post("/user/auth/register").send({
        email: testEmail,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      const loginRes = await request(app).post("/user/auth/login").send({
        email: testEmail,
        password: testPassword,
      });

      authToken = loginRes.body;
    });

    it("should return 401 for invalid/missing authentication token", async () => {
      const res = await request(app)
        .patch("/user/password/change-password")
        .send({
          currentPassword: testPassword,
          newPassword: newPassword,
        });

      expect(res.status).toBe(401);
    });

    it("Should return 400 for missing either current password or new password", async () => {
      await request(app)
        .patch("/user/password/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ newPassword: newPassword })
        .expect(400);

      await request(app)
        .patch("/user/password/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ currentPassword: testPassword })
        .expect(400);
    });

    it("Should return 400 when current password and new password are the same", async () => {
      const res = await request(app)
        .patch("/user/password/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: testPassword,
        })
        .expect(400);
    });

    it("Should return 400 for incorrect current password", async () => {
      const res = await request(app)
        .patch("/user/password/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: newPassword,
        })
        .expect(400);
    });

    it("should successfully change password with valid current password", async () => {
      await request(app)
        .patch("/user/password/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: newPassword,
        })
        .expect(200);

      await request(app)
        .post("/user/auth/login")
        .send({
          email: testEmail,
          password: newPassword,
        })
        .expect(200);
    });

    it("should invalidate refresh token after password change", async () => {
      const session1 = await request(app).post("/user/auth/login").send({
        email: testEmail,
        password: testPassword,
      });

      await request(app)
        .patch("/user/password/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: newPassword,
        });

      await request(app)
        .get("/user/auth/refresh")
        .set("Cookie", `jwt=${authToken}`)
        .expect(403);
    });
  });
});
