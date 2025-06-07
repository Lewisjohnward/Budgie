import { prisma } from "../../../../shared/prisma/client";

export const updateRefreshToken = async (
  email: string,
  refreshToken: string,
) => {
  return await prisma.user.update({
    where: { email },
    data: { refreshToken },
  });
};
