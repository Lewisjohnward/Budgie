import { getCategoryGroups } from "../../utils/appSnapshot";
import { login, registerUser } from "../../utils/auth";
import { getCategoryGroupsRaw } from "../../utils/categoryGroup";

describe("Category group", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Get", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await getCategoryGroupsRaw("invalid-cookie");

        expect(res.statusCode).toBe(401);
      });
    });
    describe("Success", () => {
      it("Should return category groups for user", async () => {
        const categoryGroupMap = await getCategoryGroups(cookie);

        expect(categoryGroupMap).toBeDefined();
        expect(categoryGroupMap.user).toBeDefined();
        expect(categoryGroupMap.system).toBeDefined();
        const group = Object.values(categoryGroupMap.user)[0];

        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("position");
      });
    });
  });
});
