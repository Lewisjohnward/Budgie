import { randomBytes, createHash } from "crypto";
import { promisify } from "util";
import { prisma } from "../../../../shared/prisma/client";

const generateToken = async () => {
  const buf = await promisify(randomBytes)(32);
  return buf.toString("hex");
};

const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const createPasswordResetToken = async (userId: string) => {
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  });

  const rawToken = await generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  return rawToken;
};
