import request from "supertest";
import jwt from "jsonwebtoken";
import {
  DecodeToken,
  GenerateAccessToken,
  GenerateRefreshToken,
  ValidateSignature,
} from "./PasswordUtility";

describe("Password utility", () => {
  describe("Generate refresh/access token", () => {
    it("Signing/Decoding access token works", () => {
      const claims = { _id: "id", email: "test@email.com" };
      const accessToken = GenerateAccessToken(claims);
      const decoded = DecodeToken(accessToken);
      expect(decoded).toEqual({
        ...claims,
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it("Signing/Decoding access token with wrong key throws error", () => {
      const claims = { _id: "id", email: "test@email.com" };
      const accessToken = GenerateAccessToken(claims);

      try {
        jwt.verify(accessToken, "WRONG_KEY");
      } catch (error) {
        expect(error instanceof jwt.JsonWebTokenError).toBeTruthy();
      }
    });

    it("Signing/Decoding refresh token works", () => {
      const claims = { _id: "id", email: "test@email.com" };
      const accessToken = GenerateRefreshToken(claims);
      const decoded = DecodeToken(accessToken);
      expect(decoded).toEqual({
        ...claims,
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it("Signing/Decoding refresh token with wrong key throws error", () => {
      const claims = { _id: "id", email: "test@email.com" };
      const accessToken = GenerateRefreshToken(claims);

      try {
        jwt.verify(accessToken, "WRONG_KEY");
      } catch (error) {
        expect(error instanceof jwt.JsonWebTokenError).toBeTruthy();
      }
    });
  });
  describe("ValidateSignature", () => {
    it.todo("should return true and populate req.user for a valid token");

    it.todo("Should return false when signature is undefined");

    it.todo("Should append req.user if decoded correctly");

    it.todo("Should return true if decoded correctly");

    it.todo("Should return false if decode fails");
  });
});
