import { Request, Response, NextFunction } from "express";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
import { RegisterUserInput, UserLoginInput } from "../dto";
import * as EmailValidator from "email-validator";
import { PasswordSchema } from "../utility/PasswordUtility";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, password } = <RegisterUserInput>req.body;

  const validEmail = EmailValidator.validate(email);
  const inValidPassword = !PasswordSchema().validate(password);

  if (inValidPassword) {
    res.status(422).json({ message: "Password invalid" });
    return;
  }

  if (!email || !username || !password || !validEmail) {
    res.status(422).json({ message: "There has been an error signing up" });
    return;
  }

  // TODO: NEED TO HASH PASSWORD

  const emailUsed = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailUsed) {
    res.status(422).json({ message: "There has been an error signing up" });
    return;
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password,
    },
  });

  res.status(200).json({ message: "register" });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = <UserLoginInput>req.body;

  // TODO: WE NEED ERROR CHECKING HERE

  if (email || password) {
    res.json({ message: "There has been an error signing up" });
    return;
  }
  res.status(200).json({ message: "login" });
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({ message: "refresh" });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({ message: "Forgot password" });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({ message: "reset password" });
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({ message: "Change password" });
};
