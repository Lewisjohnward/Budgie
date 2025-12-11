import { Prisma } from "@prisma/client";

export type Payee = Prisma.PayeeGetPayload<object>;

export type NormalisedPayees = {
  payees: {
    [key: string]: Payee;
  };
};
