import { subtractMoney } from "@/core/utils/money";

export type NetChange = {
  inflow?: number;
  outflow?: number;
};

export const calculateNetChange = (
  inflow: number,
  outflow: number
): NetChange => {
  const netChange = subtractMoney(inflow, outflow);

  return {
    inflow: netChange > 0 ? netChange : undefined,
    outflow: netChange < 0 ? Math.abs(netChange) : undefined,
  };
};
