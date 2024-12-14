import request from "supertest";
import jwt from "jsonwebtoken";
import {
  DecodeToken,
  GenerateAccessToken,
  GenerateRefreshToken,
} from "./PasswordUtility";

describe("Password utility", () => {
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
    //
    // const accessToken = GenerateAccessToken(claims);
    // const decoded = DecodeToken(accessToken);
    // expect(decoded).toEqual({
    //   ...claims,
    //   iat: expect.any(Number),
    //   exp: expect.any(Number),
    // });
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

  // it("Not found for site 404", async () => {});

  // it("Health check route returns valid response", async () => {});
});

// afterAll(async () => {
//   await db.end()
// })
