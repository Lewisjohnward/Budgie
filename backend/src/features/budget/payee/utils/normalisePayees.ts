import { Payee, NormalisedPayees } from "../payee.types";

export function normalisePayees(payees: Payee[]): NormalisedPayees {
  const normalisedPayees = payees.reduce(
    (acc, payee) => {
      acc[payee.id] = payee;
      return acc;
    },
    {} as Record<string, Payee>
  );

  return {
    payees: normalisedPayees,
  };
}
