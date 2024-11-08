import { Request, Response, NextFunction } from "express";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
import { RegisterUserInput, UserLoginInput } from "../dto";
import * as EmailValidator from "email-validator";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  PasswordSchema,
  ValidatePassword,
} from "../utility/PasswordUtility";

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

  const userAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userAlreadyExists) {
    res.status(422).json({ message: "There has been an error signing up" });
    return;
  }

  const salt = await GenerateSalt();
  const passwordHash = await GeneratePassword(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: passwordHash,
      salt,
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

  if (!email || !password) {
    res.status(422).json({ message: "There has been an error logging in" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(422).json({ message: "There has been an error logging in" });
    return;
  }

  const validPassword = await ValidatePassword(
    password,
    user.password,
    user.salt,
  );

  if (!validPassword) {
    res.status(422).json({ message: "There has been an error logging in" });
    return;
  }

  const signature = GenerateSignature({
    _id: user.id,
    email: user.email,
  });

  res.status(200).json(signature);
  return;
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
