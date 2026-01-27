import { v4 as uuidv4 } from "uuid";
import { getCategories } from "../utils/getData";
import { LENGTH_ON_SIGNUP, updateMemo } from "../utils/memo";
import { registerUser, login } from "../utils/auth";
describe("Memo", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Edit", () => {
    describe("Resource resolution", () => {
      it("Should return 404 when memo id is missing", async () => {
        const memoId = "";

        const res = await updateMemo(cookie, memoId);
        expect(res.status).toBe(404);
      });
    });

    describe("Validation", () => {
      it("Should return 400 if content.length > 300", async () => {
        const memoId = uuidv4();

        const largeString = "a".repeat(301);
        const res = await updateMemo(cookie, memoId, largeString);

        expect(res.status).toBe(400);
      });
      it("Should return 400 if invalid uuid", async () => {
        const invalidUuid = "invalid";
        const updatedContent = "edit test";
        const res = await updateMemo(cookie, invalidUuid, updatedContent);
        expect(res.status).toBe(400);
      });
    });
    describe("Authentication", () => {
      it("Should return 404 memo doesn't exist", async () => {
        const dummyUuid = uuidv4();
        const updatedContent = "edit test";
        const res = await updateMemo(cookie, dummyUuid, updatedContent);
        expect(res.status).toBe(404);
      });

      it("Should return 404 if memo unowned", async () => {
        // Create + login as a second user
        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        // Grab a memo id belonging to user2
        const { memoByMonth: memoByMonthUser2, monthKeys: monthKeysUser2 } =
          await getCategories(cookie2);

        const someMonthKey = monthKeysUser2[0];
        expect(someMonthKey).toBeDefined();

        const memoIdOwnedByUser2 = memoByMonthUser2[someMonthKey]?.id;
        expect(memoIdOwnedByUser2).toEqual(expect.any(String));

        // Attempt to update that memo using user1's cookie -> should look "not found"
        const res = await updateMemo(cookie, memoIdOwnedByUser2, "hacked");
        expect(res.status).toBe(404);
      });
    });

    describe("Success", () => {
      it("Should return 200 when editing memo", async () => {
        const { memoByMonth, monthKeys } = await getCategories(cookie);

        const someMonthKey = monthKeys[0];
        const memoId = memoByMonth[someMonthKey]?.id;
        const res = await updateMemo(cookie, memoId, "updated");
        expect(res.status).toBe(200);

        const { memoByMonth: updatedMemoByMonth } = await getCategories(cookie);
        expect(updatedMemoByMonth[someMonthKey].content).toBe("updated");
        expect(updatedMemoByMonth[someMonthKey].id).toBe(memoId);
      });
    });
  });
});
