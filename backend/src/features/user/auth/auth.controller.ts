import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { registerUserSchema } from "./auth.schema";
import {
  EmailAlreadyRegisteredError,
  MissingCredentialsError,
  InvalidCredentialsError,
  InvalidOrExpiredRefreshTokenError,
  RefreshTokenNoUserFoundError,
} from "./auth.errors";
import { userExists } from "./use-cases/userExists";
import { authService } from "./auth.service";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "./utils/cookies";
import { GenerateAccessToken, GenerateRefreshToken } from "./utils/tokens";
import {
  GenerateSalt,
  GeneratePassword,
  ValidatePassword,
} from "./utils/password";
import { categoryService } from "../../budget/category/category.service";
import { prisma } from "../../../shared/prisma/client";
import { memoService } from "../../budget/memo/memo.service";
import { asUserId } from "./auth.types";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new MissingCredentialsError());
    return;
  }

  try {
    const payload = registerUserSchema.parse({ email, password });
    const userAlreadyExists = await userExists(payload.email);

    if (userAlreadyExists) {
      next(new EmailAlreadyRegisteredError());
      return;
    }

    const salt = await GenerateSalt();
    const passwordHash = await GeneratePassword(password, salt);

    const user = await authService.createUser({
      email,
      password: passwordHash,
      salt,
    });

    const uId = asUserId(user.id);
    await categoryService.categories.initialiseCategories(uId);

    await prisma.$transaction(async (tx) => {
      await memoService.initialiseMemos(tx, uId);
    });

    const accessToken = GenerateAccessToken({
      _id: user.id,
      email: user.email,
    });

    const refreshToken = GenerateRefreshToken({
      _id: user.id,
      email: user.email,
    });

    await authService.updateRefreshToken(email, refreshToken);

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
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new MissingCredentialsError());
    return;
  }

  try {
    const user = await authService.getUser(email);

    if (!user) {
      next(new InvalidCredentialsError());
      return;
    }

    const validPassword = await ValidatePassword(
      password,
      user.password,
      user.salt
    );

    if (!validPassword) {
      next(new InvalidCredentialsError());
      return;
    }

    const uId = asUserId(user.id);
    await categoryService.months.ensureMonthsContinuity(prisma, uId);

    const accessToken = GenerateAccessToken({
      _id: user.id,
      email: user.email,
    });

    const refreshToken = GenerateRefreshToken({
      _id: user.id,
      email: user.email,
    });

    await authService.updateRefreshToken(email, refreshToken);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json(accessToken);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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
