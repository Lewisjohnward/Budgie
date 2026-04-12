import jwt from "jsonwebtoken";
import { type AuthPayload } from "../../../../shared/types/user";

/**
 * Generates a signed JWT access token for authenticated requests.
 *
 * @param payload - The token payload containing user identity information.
 * @returns A signed JWT access token valid for 1 day.
 */
export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.PAYLOAD_SECRET!, { expiresIn: "1d" });
};

/**
 * Generates a signed JWT refresh token used to obtain new access tokens.
 *
 * @param payload - The token payload containing user identity information.
 * @returns A signed JWT refresh token valid for 1 day.
 */
export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.PAYLOAD_SECRET!, { expiresIn: "1d" });
};
