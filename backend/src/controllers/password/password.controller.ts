import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createPasswordResetToken } from "../../utility/password/resetToken";
import { generatePasswordResetLink } from "../../utility/password/resetLink";
import { sendPasswordResetEmail } from "../../services/email.service";
import {
  CurrentPasswordIncorrectError,
  CurrentPasswordNewPasswordError,
  EmailRequiredError,
  PasswordRequiredError,
} from "../../errors/PasswordErrors";
import {
  GeneratePassword,
  GenerateRefreshToken,
  GenerateSalt,
} from "../../utility/user/PasswordUtility";
import { changePasswordSchema } from "../../schemas";
import { z } from "zod";
import { setRefreshTokenCookie } from "../../utility";

const prisma = new PrismaClient();

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      next(new EmailRequiredError());
      return;
    }
    const normalisedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (!user) {
      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    const resetToken = await createPasswordResetToken(user.id);

    const resetLink = generatePasswordResetLink(resetToken);

    await sendPasswordResetEmail(
      user.email,
      resetLink,
      user.email.split("@")[0],
    );

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
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
  try {
    const { currentPassword, newPassword } = req.body;

    const userId = req.user!._id;

    if (!currentPassword || !newPassword) {
      throw new PasswordRequiredError();
    }

    const validatedPassword = changePasswordSchema.parse({
      currentPassword,
      newPassword,
    });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true,
      },
    });

    const isPasswordValid = await bcrypt.compare(
      validatedPassword.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new CurrentPasswordIncorrectError();
    }

    const salt = await GenerateSalt();
    const hashedPassword = await GeneratePassword(
      validatedPassword.newPassword,
      salt,
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
        salt: salt,
      },
    });

    const refreshToken = GenerateRefreshToken({
      _id: user.id,
      email: user.email,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new CurrentPasswordNewPasswordError());
      return;
    }
    next(error);
  }
};
