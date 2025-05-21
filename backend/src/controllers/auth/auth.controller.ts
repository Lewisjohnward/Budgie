import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { RegisterUserInput, UserLoginInput } from "../../dto";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateAccessToken,
  createUser,
  getUser,
  updateRefreshToken,
  userExists,
  validateCredentials,
  ValidatePassword,
  GenerateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../../utility";
import { z } from "zod";
import { initialiseCategories } from "../../utility";
import {
  EmailAlreadyRegisteredError,
  InvalidOrExpiredRefreshTokenError,
  MissingCredentialsError,
  InvalidCredentialsError,
  RefreshTokenNoUserFoundError,
} from "../../errors";

const prisma = new PrismaClient();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = <RegisterUserInput>req.body;

  if (!email || !password) {
    next(new MissingCredentialsError());
    return;
  }

  try {
    validateCredentials({ email, password });
    const userAlreadyExists = await userExists(email);

    if (userAlreadyExists) {
      next(new EmailAlreadyRegisteredError());
      return;
    }

    const salt = await GenerateSalt();
    const passwordHash = await GeneratePassword(password, salt);

    const user = await createUser({ email, password: passwordHash, salt });
    await initialiseCategories(user.id);

    const accessToken = GenerateAccessToken({
      _id: user.id,
      email: user.email,
    });

    const refreshToken = GenerateRefreshToken({
      _id: user.id,
      email: user.email,
    });

    await updateRefreshToken(email, refreshToken);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json(accessToken);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new InvalidCredentialsError());
      return;
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = <UserLoginInput>req.body;

  if (!email || !password) {
    next(new MissingCredentialsError());
    return;
  }

  try {
    const user = await getUser(email);

    if (!user) {
      next(new InvalidCredentialsError());
      return;
    }

    const validPassword = await ValidatePassword(
      password,
      user.password,
      user.salt,
    );

    if (!validPassword) {
      next(new InvalidCredentialsError());
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

    await updateRefreshToken(email, refreshToken);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json(accessToken);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      res.sendStatus(204);
      return;
    }

    const refreshToken = cookies.jwt;

    const user = await prisma.user.findUnique({
      where: { refreshToken },
    });

    if (!user) {
      clearRefreshTokenCookie(res);
      res.sendStatus(204);
      return;
    }

    await prisma.user.update({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    clearRefreshTokenCookie(res);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      next(new InvalidOrExpiredRefreshTokenError());
      return;
    }

    const refreshToken = cookies.jwt;

    const user = await prisma.user.findUnique({
      where: { refreshToken },
    });

    if (!user) {
      clearRefreshTokenCookie(res);
      next(new RefreshTokenNoUserFoundError());
      return;
    }

    jwt.verify(refreshToken, process.env.PAYLOAD_SECRET!);

    const token = GenerateAccessToken({
      _id: user.id,
      email: user.email,
    });
    res.json({ token, email: user.email });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new InvalidOrExpiredRefreshTokenError());
    } else {
      next(error);
    }
  }
};
