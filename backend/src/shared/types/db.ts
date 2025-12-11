import { Month, Prisma } from "@prisma/client";

type CategoryGroup = Prisma.CategoryGroupGetPayload<{
  include: { categories: { include: { months: true } } };
}>;

type Category = Prisma.CategoryGetPayload<{
  include: { months: true };
}>;

type Account = Prisma.AccountGetPayload<{
  include: {
    transactions: {
      include: { category: { include: { categoryGroup: true } } };
    };
  };
}>;

type Transaction = Prisma.TransactionGetPayload<{}>;

export type { CategoryGroup, Category, Month, Account, Transaction };
