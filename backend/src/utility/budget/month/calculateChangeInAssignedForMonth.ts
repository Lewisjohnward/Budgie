import { PrismaClient } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/convertDecimalToNumber";

const prisma = new PrismaClient();

export const calculateChangeInAssignedForMonth = async ({
  monthId,
  assigned,
  userId,
}: {
  monthId: string;
  assigned: number;
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
