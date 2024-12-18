import app from "../app";
import request from "supertest";
import emailValidator, { validate } from "email-validator";
import { NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createUser, userExists } from "../utility/UserUtility";

jest.mock("../utility/UserUtility");

describe("User Controller", () => {
  describe("register", () => {
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

      expect(noEmailReponse.status).toBe(400);

      const noPasswordReponse = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com" })
        .set("Authorization", "Bearer mock-token");

      expect(noPasswordReponse.status).toBe(400);
    });

    it("Should return 422 if email is invalid", async () => {
      const response = await request(app)
        .post("/user/register")
        .send({ email: "invalid", password: "abcdefgG8£" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(422);
    });

    it("Should return 422 if password is invalid", async () => {
      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "test" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(422);
    });

    it("Should return 422 if password is invalid", async () => {
      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "test" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(422);
    });

    it("Should return 400 if the user already exists", async () => {
      (userExists as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "abdegh745K!" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
    });
    it("Should return 200 and register user", async () => {
      (userExists as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "abdegh745K!" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
    });

    it("Should return 500 if unable to create user", async () => {
      (userExists as jest.Mock).mockResolvedValue(true);
      // Mock the password schema to throw an error
      (createUser as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test placeholder");
      });

      const response = await request(app)
        .post("/user/register")
        .send({ email: "test@email.com", password: "abdegh745K!" })
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(400);
    });
  });


});
