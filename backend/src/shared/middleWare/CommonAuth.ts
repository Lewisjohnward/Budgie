import { Request, Response, NextFunction } from "express";
import { UserNotAuthorisedError, MissingOrMalformedAuthorizationHeaderError } from "../errors/auth.errors";
import { DecodeToken } from "../utils/auth/decodeToken";
import { AuthPayload } from "../types/user";


declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await ValidateSignature(req);
    next();
  } catch (error) {
    next(error);
  }
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