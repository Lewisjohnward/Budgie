import { Decimal } from "@prisma/client/runtime/library";

export function convertDecimalToNumber(
  value: Decimal | null | undefined,
): number {
  return value ? value.toNumber() : 0;
}
