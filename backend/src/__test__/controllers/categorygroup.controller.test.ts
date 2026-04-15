import { login, registerUser } from "../utils/auth";
import {
  getCategoryGroups,
  getCategoryGroupsRaw,
} from "../utils/categoryGroup";

describe("Category group", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Get", () => {
    describe("Error Cases", () => {
      it("Should reject unauthenticated requests", async () => {
        const res = await getCategoryGroupsRaw("invalid-cookie");

        expect(res.statusCode).toBe(401);
      });
      it.todo("should prevent name collision");
      it.todo("should create a category group");
      it.todo("should correctly update position");
    });
    describe("Success", () => {
      it("Should return category groups for user", async () => {
        const categoryGroupMap = await getCategoryGroups(cookie);

        expect(categoryGroupMap).toBeDefined();

        const group = Object.values(categoryGroupMap)[0];

        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("position");
        expect(group).toHaveProperty("categoryIds");
        expect(Array.isArray(group.categoryIds)).toBe(true);
      });
    });
  });
  describe("create", () => {
    it.todo("should prevent name collision");
    it.todo("should create a category group");
    it.todo("should correctly update position");
  });

  describe("edit", () => {
    it.todo("should prevent name collision");
    it.todo("should prevent user from editing protected categories");
    it.todo("should update name");
    it.todo("should update position");
    it.todo("should prevent user editing non existent / other users groups");
  });

  describe("delete", () => {
    it.todo("should delete category group");
    it.todo("should prevent user from deleting protected categories");
    it.todo("should update name");
    it.todo("should transfer to inherting category");
    it.todo("should prevent user deleting non existent / other users groups");
  });
});
