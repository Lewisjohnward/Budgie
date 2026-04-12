import { asUserId, db, DomainUser } from "../../../user/auth/auth.types";

export const toDomainUser = (u: db.User): DomainUser => {
  return {
    id: asUserId(u.id),
    email: u.email,
    password: u.password,
    salt: u.salt
  };
};
