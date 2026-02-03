import { Brand } from "../../../../shared/types/brand";
import { type UserId } from "../../../user/auth/auth.types";

export type CategoryGroupId = Brand<string, "CategoryGroupId">;

export const asCategoryGroupId = (id: string) => id as CategoryGroupId;

export type DomainCategoryGroup = {
  id: CategoryGroupId;
  userId: UserId;
  name: string;
  position: number;
};
