import request from "supertest";
import app from "../../../app";
import { type CreateCategoryGroupPayload } from "../../../features/budget/core/categorygroup/categorygroup.schema";
import { type CreateCategoryGroupDto } from "../../../features/budget/core/categorygroup/categoryGroup.types";
import { CATEGORY_GROUPS_ENDPOINT_URL } from "./categoryGroup.endpoint";
import { type TestCategoryGroup } from "../types/models";

/**
 * Test version of UpdateCategoryGroupPayload.
 *
 * Omits `userId` because it is derived internally from the authentication cookie
 * and is not provided directly in test requests.
 */
type CreateCategoryGroupPayloadTest = Omit<
  CreateCategoryGroupPayload,
  "userId"
>;

type CreateCategoryGroupResponse = {
  body: CreateCategoryGroupDto;
  status: number;
};

/**
 * Creates a category group and returns the raw HTTP response.
 */
export const createCategoryGroupRaw = async (
  cookie: string,
  payload: CreateCategoryGroupPayloadTest
): Promise<CreateCategoryGroupResponse> => {
  const res = await request(app)
    .post(CATEGORY_GROUPS_ENDPOINT_URL)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return {
    body: res.body as CreateCategoryGroupDto,
    status: res.status,
  };
};

/*
 * Create category group for the user
 */
export const createCategoryGroup = async (
  cookie: string,
  payload: CreateCategoryGroupPayloadTest
): Promise<TestCategoryGroup> => {
  const res = await createCategoryGroupRaw(cookie, payload);

  const categoryGroup = res.body.created.categoryGroup;

  return categoryGroup;
};
