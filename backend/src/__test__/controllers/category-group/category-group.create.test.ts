import { getCategoryGroups } from "../../utils/appSnapshot";
import { registerUser, login } from "../../utils/auth";
import {
  createCategoryGroupRaw,
  createCategoryGroup,
} from "../../utils/category-group/categoryGroup.create";

describe("Category group", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Create", () => {
    describe("Error cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await createCategoryGroupRaw("0000", { name: "test" });

        expect(res.status).toBe(401);
      });
      it("Should return 409 on name collision", async () => {
        await createCategoryGroupRaw(cookie, { name: "test" });

        const res = await createCategoryGroupRaw(cookie, { name: "test" });

        expect(res.status).toBe(409);

        const groups = await getCategoryGroups(cookie);
        const matches = Object.values(groups.user).filter(
          (g) => g.name === "test"
        );

        expect(matches).toHaveLength(1);
      });
    });
    describe("Success", () => {
      it("Should create a category group and return it", async () => {
        const before = await getCategoryGroups(cookie);

        const createdCategoryGroup = await createCategoryGroup(cookie, {
          name: "new-group",
        });

        // response should return the created category group
        expect(createdCategoryGroup).toBeDefined();
        expect(createdCategoryGroup.name).toBe("new-group");

        const after = await getCategoryGroups(cookie);

        // verify it exists in persisted state
        const created = Object.values(after.user).find(
          (g) => g.name === "new-group"
        );

        expect(created).toBeDefined();
        expect(created!.name).toBe("new-group");

        // position
        const positions = Object.values(after.user).map((g) => g.position);

        expect(new Set(positions).size).toBe(positions.length);

        expect(positions).toEqual(
          Array.from({ length: positions.length }, (_, i) => i)
        );

        // count increased
        expect(Object.keys(after.user).length).toBe(
          Object.keys(before.user).length + 1
        );
      });
      it("Should trim whitespace", async () => {
        expect.hasAssertions();
      });
    });
  });
});
