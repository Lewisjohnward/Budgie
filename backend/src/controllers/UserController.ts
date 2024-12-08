import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { RegisterUserInput, UserLoginInput } from "../dto";
import * as EmailValidator from "email-validator";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateAccessToken,
  PasswordSchema,
  ValidatePassword,
  GenerateRefreshToken,
} from "../utility/PasswordUtility";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = <RegisterUserInput>req.body;

  const validEmail = EmailValidator.validate(email);
  const inValidPassword = !PasswordSchema().validate(password);

  if (inValidPassword) {
    res.status(422).json({ message: "Password invalid" });
    return;
  }

  if (!email || !password || !validEmail) {
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

  const accessToken = GenerateAccessToken({
    _id: user.id,
    email: user.email,
  });

  const refreshToken = GenerateRefreshToken({
    _id: user.id,
    email: user.email,
  });

  user.refreshToken = refreshToken;
  const result = await prisma.user.update({
    where: { email },
    data: { refreshToken: refreshToken },
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json(accessToken);

  return;
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: remove refresh token

  const cookies = req.cookies;
  if (!cookies?.jwt) {
    console.log("no cookies found");
    res.sendStatus(204); // No content
    return;
  }

  const refreshToken = cookies.jwt;

  // Is refresh token in db?
  const user = await prisma.user.findUnique({
    where: { refreshToken },
  });

  if (!user) {
    console.log("no user found");
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV == "production",
    });
    res.sendStatus(204);
    return;
  }

  // user.refreshToken = null;
  const result = await prisma.user.update({
    where: { refreshToken },
    data: { refreshToken: null },
  });

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV == "production",
  });
  res.sendStatus(204);
  return;
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    console.log(" no cookies");
    res.sendStatus(401); // No content
    return;
  }

  const refreshToken = cookies.jwt;

  const user = await prisma.user.findUnique({
    where: { refreshToken },
  });

  if (!user) {
    console.log(" no user");
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV == "production",
    });
    res.sendStatus(403);
    return;
  }

  try {
    jwt.verify(refreshToken, process.env.PAYLOAD_SECRET!);

    const token = GenerateAccessToken({
      _id: user.id,
      email: user.email,
    });
    res.json({ token, email: user.email });
    return;
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
    return;
  }
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
