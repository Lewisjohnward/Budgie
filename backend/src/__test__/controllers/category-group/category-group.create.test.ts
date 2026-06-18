import {
  getCategoryGroups,
  getUserCategoryGroupByIdOrThrow,
} from "../../utils/appSnapshot";
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
      it("Should return 400 when name is empty", async () => {
        const before = await getCategoryGroups(cookie);

        const res = await createCategoryGroupRaw(cookie, {
          name: "",
        });

        expect(res.status).toBe(400);

        const after = await getCategoryGroups(cookie);

        expect(after.user).toEqual(before.user);
      });
      it("Should return 400 when name exceeds max length (50)", async () => {
        const before = await getCategoryGroups(cookie);

        const res = await createCategoryGroupRaw(cookie, {
          name: "a".repeat(51),
        });

        expect(res.status).toBe(400);

        const after = await getCategoryGroups(cookie);

        expect(after.user).toEqual(before.user);
      });
      it("Should return 409 on name collision", async () => {
        await createCategoryGroupRaw(cookie, { name: "test" });

        const res = await createCategoryGroupRaw(cookie, { name: "test" });

        expect(res.status).toBe(409);

        const groups = await getCategoryGroups(cookie);
        const group = Object.values(groups.user).filter(
          (g) => g.name === "test"
        );

        expect(group).toHaveLength(1);
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
        const created = await getUserCategoryGroupByIdOrThrow(
          cookie,
          createdCategoryGroup.id
        );
        expect(created).toBeDefined();
        expect(created!.name).toBe("new-group");

        // count increased
        expect(Object.keys(after.user).length).toBe(
          Object.keys(before.user).length + 1
        );
      });
      it("Should trim whitespace", async () => {
        const createdCategoryGroup = await createCategoryGroup(cookie, {
          name: " new-group ",
        });

        // response should return the created category group
        expect(createdCategoryGroup).toBeDefined();
        expect(createdCategoryGroup.name).toBe("new-group");

        const created = await getUserCategoryGroupByIdOrThrow(
          cookie,
          createdCategoryGroup.id
        );

        expect(created.name).toBe("new-group");
      });
      it("Should assign the next available position incrementally", async () => {
        // Create a category group to anchor our positions
        const baseGroup = await createCategoryGroup(cookie, {
          name: "baseline-group",
        });

        // Create a second group right after it
        const nextGroup = await createCategoryGroup(cookie, {
          name: "incremented-group",
        });

        expect(nextGroup.position).toBe(baseGroup.position + 1);
      });
      it("Should allow different users to create category groups with the same name", async () => {
        const groupA = await createCategoryGroup(cookie, {
          name: "Laundry",
        });

        await registerUser({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const cookieB = await login({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const groupB = await createCategoryGroup(cookieB, {
          name: "Laundry",
        });

        // Both succeed
        expect(groupA).toBeDefined();
        expect(groupB).toBeDefined();

        // User A can see only A's group
        const userAGroups = await getCategoryGroups(cookie);
        expect(
          Object.values(userAGroups.user).some((g) => g.id === groupB.id)
        ).toBe(false);

        // User B can see only B's group
        const userBGroups = await getCategoryGroups(cookieB);
        expect(
          Object.values(userBGroups.user).some((g) => g.id === groupA.id)
        ).toBe(false);
      });
    });
  });
});
