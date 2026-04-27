import { type UserId } from "../../../../../user/auth/auth.types";
import { DomainPayee } from "../../payee.types";
import { payeeRepository } from "../../../../../../shared/repository/payeeRepositoryImpl";
import { toDomainPayee } from "../../mappers/toDomainPayee";

export async function getPayees(userId: UserId): Promise<DomainPayee[]> {
  const rawPayees = await payeeRepository.getPayees(userId);

  return rawPayees.map(toDomainPayee);
}
