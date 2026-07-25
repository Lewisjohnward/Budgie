import { type AccountDto } from "../../../core/account/account.types";
import { type MonthDto } from "../../../core/category/core/category.types";
import {
  CategorySystemDto,
  CategoryUserDto,
} from "../../../core/category/core/types/category.dto";
import {
  type CategoryGroupSystemDto,
  type CategoryGroupUserDto,
} from "../../../core/categorygroup/categoryGroup.types";
import { type MemoDto } from "../../../core/memo/memo.types";
import { type PayeeDto } from "../../../core/payee/payee.types";
import { type TransactionDto } from "../../../core/transaction/transaction.types";

export type BudgetHydrationDto = {
  categoryGroups: {
    user: Record<string, CategoryGroupUserDto>;
    inflow: CategoryGroupSystemDto;
    uncategorised: CategoryGroupSystemDto;
  };
  categories: {
    user: Record<string, CategoryUserDto>;
    rta: CategorySystemDto;
    uncategorised: CategorySystemDto;
  };
  months: Record<string, MonthDto>;
  accounts: Record<string, AccountDto>;
  transactions: Record<string, TransactionDto>;
  payees: Record<string, PayeeDto>;
  memosByMonth: Record<string, MemoDto>;
  monthKeys: string[];
};
