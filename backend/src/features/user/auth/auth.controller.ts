import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { registerSchema } from "./auth.schema";
import {
  InvalidOrExpiredRefreshTokenError,
  RefreshTokenNoUserFoundError,
} from "./auth.errors";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "./utils/cookies";
import { generateAccessToken } from "./utils/tokens";
import { prisma } from "../../../shared/prisma/client";
import { authUseCase } from "./auth.useCase";

/*
 * Handles user registration: validates input, creates account, sets refresh token cookie, and returns access token
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = registerSchema.parse(req.body);

    const { accessToken, refreshToken } = await authUseCase.register(payload);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json(accessToken);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = registerSchema.parse(req.body);

    const { accessToken, refreshToken } = await authUseCase.login(payload);

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

    const token = generateAccessToken({
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
