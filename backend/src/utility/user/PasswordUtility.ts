import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserPayload } from "../../dto";

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

  try {
    if (signature) {
      const token = signature.split(" ")[1];
      const payload = DecodeToken(token);

      req.user = payload;

      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};
