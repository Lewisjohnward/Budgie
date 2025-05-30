import { PrismaClient } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/_index";

const prisma = new PrismaClient();

export const calculateChangeInAssignedForMonth = async ({
  assigned,
  monthId,
  userId,
}: {
  assigned: number;
  monthId: string;
  userId: string;
}) => {
  const month = await prisma.month.findFirstOrThrow({
    where: {
      id: monthId,
      category: {
        userId,
      },
    },
  });

  return convertDecimalToNumber(month.assigned) - assigned;
};
