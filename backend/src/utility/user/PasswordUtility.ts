import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserPayload } from "../../dto";
import {
  MissingOrMalformedAuthorizationHeaderError,
  UserNotAuthorisedError,
} from "../../errors";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string,
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

// TODO: decrease access token time
export const GenerateAccessToken = (payload: UserPayload) => {
  return jwt.sign(payload, process.env.PAYLOAD_SECRET!, { expiresIn: "1d" });
};

export const GenerateRefreshToken = (payload: UserPayload) => {
  return jwt.sign(payload, process.env.PAYLOAD_SECRET!, { expiresIn: "1d" });
};

export const DecodeToken = (token: string) => {
  return jwt.verify(token, process.env.PAYLOAD_SECRET!) as UserPayload;
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get("Authorization");

  if (!signature || !signature.startsWith("Bearer ")) {
    throw new MissingOrMalformedAuthorizationHeaderError();
  }
  const token = signature.split(" ")[1];

  try {
    const payload = DecodeToken(token);
    req.user = payload;
    return true;
  } catch (error) {
    throw new UserNotAuthorisedError();
  }
};
