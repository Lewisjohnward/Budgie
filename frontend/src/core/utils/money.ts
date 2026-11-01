import Decimal from "decimal.js";

type MoneyValue = Decimal.Value;

export const addMoney = (...values: MoneyValue[]): number =>
  values
    .reduce<Decimal>((total, value) => total.plus(value), new Decimal(0))
    .toNumber();

export const subtractMoney = (a: MoneyValue, b: MoneyValue): number =>
  new Decimal(a).minus(b).toNumber();
