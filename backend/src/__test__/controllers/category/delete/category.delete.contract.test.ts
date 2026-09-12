import path from "node:path";
import jestOpenAPI from "jest-openapi";
import { deleteCategoryRaw } from "../../../utils/category/category.delete";
import { registerUser, login } from "../../../utils/auth";
import { createGroupWithCategory } from "../../../utils/scenarios/createGroupWithCategory";

jestOpenAPI(path.resolve(__dirname, "../../../../../docs/api/openapi.yml"));
describe("DELETE /budget/categories/{categoryId}", () => {
  let cookie: string;
  let categoryId: string;
  let categoryGroupId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create a category
    const { category, categoryGroup } = await createGroupWithCategory(cookie);
    categoryId = category.id;
    categoryGroupId = categoryGroup.id;
  });
  it.skip("conforms to OpenAPI contract (jest-openapi external Path Item $ref limitation)", async () => {
    const res = await deleteCategoryRaw(cookie, categoryId);

    expect(res).toSatisfyApiSpec();
  });
});
