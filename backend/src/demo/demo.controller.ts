import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../shared/prisma/client";
import { demoService } from "./demo.service";
import { authUseCase } from "../features/user/auth/auth.useCase";
import { setRefreshTokenCookie } from "../features/user/auth/utils/cookies";

export const reset = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.$transaction(
      async (tx) => {
        await demoService.reset(tx);
        await demoService.seed(tx);
      },
      {
        timeout: 15_000,
      }
    );

    res.json({
      message: "database reset",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await authUseCase.login({
      email: process.env.DEMO_EMAIL!,
      password: process.env.DEMO_PASSWORD!,
    });

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json(accessToken);
  } catch (error) {
    next(error);
  }
};
