// import { PrismaClient } from "@prisma/client";
// import request from "supertest";
// import app from "../../app";
// import { NormalizedCategories } from "../../features/budget/category/category.types";
//
// const prisma = new PrismaClient();
//
// const testUser = {
//   email: "test@test.com",
//   password: "testpasswordABC$",
// };
//
// const registerUser = async () => {
//   const res = await request(app).post("/user/register").send(testUser);
//
//   const cookie = res.body;
//   const user = await prisma.user.findFirstOrThrow({});
//
//   const res1 = await request(app)
//     .post("/budget/categorygroup")
//     .set("Authorization", `Bearer ${cookie}`)
//     .send({
//       name: "test category group",
//     });
//
//   const categoriesResponse = await request(app)
//     .get("/budget/categories")
//     .set("Authorization", `Bearer ${cookie}`);
//
//   const responseBody = categoriesResponse.body as NormalizedCategories;
//
//   const { categoryGroups } = responseBody;
//
//   const testCategoryGroup = Object.values(categoryGroups).find(
//     (categoryGroup) => categoryGroup.name === "test category group",
//   );
//
//   if (!testCategoryGroup) throw new Error("Unable to find test category group");
//
//   const res2 = await request(app)
//     .post("/budget/category")
//     .set("Authorization", `Bearer ${cookie}`)
//     .send({
//       categoryGroupId: testCategoryGroup.id,
//       name: "test category",
//     });
//
//   const category = await prisma.category.findFirstOrThrow({
//     where: {
//       name: "test category",
//     },
//   });
//
//   const accountsRes = await request(app)
//     .get("/budget/accounts")
//     .set("Authorization", `Bearer ${cookie}`);
//
//   const catRes = await request(app)
//     .get("/budget/categories")
//     .set("Authorization", `Bearer ${cookie}`);
//
//   // console.log("WHY ARE THESE 2 DIFFERENT??");
//   // console.log(accountsRes.body);
//   // console.log(catRes.body);
// };
//
// const login = async () => {
//   const res = await request(app).post("/user/login").send(testUser);
//   const cookie = res.body;
//
//   return cookie;
// };
//
// const getCategories = async (cookie: string) => {
//   const res = await request(app)
//     .get("/budget/categories")
//     .set("Authorization", `Bearer ${cookie}`);
//   return res.body as NormalizedCategories;
// };
//
// describe("Categories Controller", () => {
//   describe("Delete category", () => {
//     beforeEach(async () => {
//       await registerUser();
//     });
//
//     it("should delete a category without transactions and no assigned amount", async () => {
//       const cookie = await login();
//       const { categories } = await getCategories(cookie);
//
//       const testCategory = Object.values(categories).find(
//         (cat) => cat.name === "test category",
//       );
//
//       if (!testCategory) throw new Error("Unable to find test category");
//
//       const response = await request(app)
//         .delete("/budget/category")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           categoryToDeleteId: testCategory.id,
//         });
//
//       expect(response.status).toBe(200);
//
//       const { categories: updatedCategories } = await getCategories(cookie);
//
//       expect(
//         Object.values(updatedCategories).some(
//           (cat) => cat.id === testCategory.id,
//         ),
//       ).toBe(false);
//     });
//
//     it("should correctly update month for a category when assigning money", async () => {
//       const cookie = await login();
//       const { categories, months } = await getCategories(cookie);
//
//       const assignedValue = "5";
//
//       const testCategory = Object.values(categories).find(
//         (cat) => cat.name === "test category",
//       );
//
//       if (!testCategory) throw new Error("Unable to find test category");
//
//       const testCategoryMonth = Object.values(months).find(
//         (month) => month.categoryId === testCategory.id,
//       );
//
//       if (!testCategoryMonth)
//         throw new Error("Unable to find test category month");
//
//       const res = await request(app)
//         .patch("/budget/month")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           assigned: assignedValue,
//           monthId: testCategoryMonth.id,
//         })
//         .expect(200);
//
//       const { months: updatedMonths } = await getCategories(cookie);
//
//       const updatedTestCategoryMonth = Object.values(updatedMonths).find(
//         (month) => month.id === testCategoryMonth.id,
//       );
//
//       expect(updatedTestCategoryMonth?.assigned).toBe(Number(assignedValue));
//     });
//
//     it("should delete a category without transactions but assigned money and move assigned amount to ready to assign - one month", async () => {
//       const cookie = await login();
//       const { categories, months } = await getCategories(cookie);
//
//       const assignedValue = "5";
//
//       const testCategory = Object.values(categories).find(
//         (cat) => cat.name === "test category",
//       );
//
//       console.log("months after test setup", months);
//
//       if (!testCategory) throw new Error("Unable to find test category");
//
//       const testCategoryMonth = Object.values(months).find(
//         (month) => month.categoryId === testCategory.id,
//       );
//
//       if (!testCategoryMonth)
//         throw new Error("Unable to find test category month");
//
//       const res = await request(app)
//         .patch("/budget/month")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           assigned: assignedValue,
//           monthId: testCategoryMonth.id,
//         })
//         .expect(200);
//
//       await request(app)
//         .delete("/budget/category")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           categoryToDeleteId: testCategory.id,
//         })
//         .expect(200);
//
//       const assignedId = Object.values(categories).find(
//         (cat) => cat.name === "Ready to Assign",
//       )?.id;
//
//       if (!assignedId) throw new Error("Unable to find assigned id");
//
//       const { categories: updatedCategories, months: updatedMonths } =
//         await getCategories(cookie);
//
//       const assignedMonths = Object.values(updatedMonths).filter(
//         (month) => month.categoryId === assignedId,
//       );
//
//       expect(
//         assignedMonths.every((month) => month.assigned === Number(0)),
//       ).toBe(true);
//
//       expect(
//         Object.values(updatedCategories).some(
//           (cat) => cat.id === testCategory.id,
//         ),
//       ).toBe(false);
//
//       expect(
//         Object.values(updatedMonths).some(
//           (month) => month.categoryId === testCategory.id,
//         ),
//       ).toBe(false);
//     });
//
//     it("should delete a category without transactions but assigned money and move assigned amount to ready to assign - multiple months", async () => {
//       const cookie = await login();
//       const { categories, months } = await getCategories(cookie);
//
//       const assignedValue = "5";
//
//       const testCategory = Object.values(categories).find(
//         (cat) => cat.name === "test category",
//       );
//
//       console.log("months after test setup", months);
//
//       if (!testCategory) throw new Error("Unable to find test category");
//
//       const testCategoryMonth = Object.values(months).find(
//         (month) => month.categoryId === testCategory.id,
//       );
//
//       if (!testCategoryMonth)
//         throw new Error("Unable to find test category month");
//
//       console.log("month a ", testCategoryMonth.id);
//       console.log("month b ", testCategory.months[1]);
//
//       await request(app)
//         .patch("/budget/month")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           assigned: "1",
//           monthId: testCategoryMonth.id,
//         })
//         .expect(200);
//
//       await request(app)
//         .patch("/budget/month")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           assigned: "10",
//           monthId: testCategory.months[1],
//         })
//         .expect(200);
//
//       await request(app)
//         .delete("/budget/category")
//         .set("Authorization", `Bearer ${cookie}`)
//         .send({
//           categoryToDeleteId: testCategory.id,
//         })
//         .expect(200);
//
//       const assignedId = Object.values(categories).find(
//         (cat) => cat.name === "Ready to Assign",
//       )?.id;
//
//       if (!assignedId) throw new Error("Unable to find assigned id");
//
//       const { categories: updatedCategories, months: updatedMonths } =
//         await getCategories(cookie);
//
//       const assignedMonths = Object.values(updatedMonths).filter(
//         (month) => month.categoryId === assignedId,
//       );
//
//       it("should handle changing of assigned months and update ready to assign amount correctly", async () => {
//         const cookie = await login();
//         const { categories, months } = await getCategories(cookie);
//
//
//         const testCategory = Object.values(categories).find(
//           (cat) => cat.name === "test category",
//         );
//
//
//         if (!testCategory) throw new Error("Unable to find test category");
//
//         const testCategoryMonth = Object.values(months).find(
//           (month) => month.categoryId === testCategory.id,
//         );
//
//         if (!testCategoryMonth)
//           throw new Error("Unable to find test category month");
//
//         console.log("month a ", testCategoryMonth.id);
//         console.log("month b ", testCategory.months[1]);
//
//         await request(app)
//           .patch("/budget/month")
//           .set("Authorization", `Bearer ${cookie}`)
//           .send({
//             assigned: "1",
//             monthId: testCategoryMonth.id,
//           })
//           .expect(200);
//
//         await request(app)
//           .patch("/budget/month")
//           .set("Authorization", `Bearer ${cookie}`)
//           .send({
//             assigned: "10",
//             monthId: testCategory.months[1],
//           })
//           .expect(200);
//
//         await request(app)
//           .delete("/budget/category")
//           .set("Authorization", `Bearer ${cookie}`)
//           .send({
//             categoryToDeleteId: testCategory.id,
//           })
//           .expect(200);
//
//         const assignedId = Object.values(categories).find(
//           (cat) => cat.name === "Ready to Assign",
//         )?.id;
//
//         if (!assignedId) throw new Error("Unable to find assigned id");
//
//         const { categories: updatedCategories, months: updatedMonths } =
//           await getCategories(cookie);
//
//         const assignedMonths = Object.values(updatedMonths).filter(
//           (month) => month.categoryId === assignedId,
//         );
//
//         expect(
//           assignedMonths.every((month) => month.assigned === Number(0)),
//         ).toBe(true);
//
//         expect(
//           Object.values(updatedCategories).some(
//             (cat) => cat.id === testCategory.id,
//           ),
//         ).toBe(false);
//
//         expect(
//           Object.values(updatedMonths).some(
//             (month) => month.categoryId === testCategory.id,
//           ),
//         ).toBe(false);
//       });
//
//       it.todo("should return 404 when deleting non-existent category?");
//
//       it.todo(
//         "should delete a category with transactions and assigned amount, moving both to the new category",
//       );
//
//       it.todo(
//         "should prevent user deleting a category with transactions and assigned amount if new category is not provided",
//       );
//
//       // it("should return all categories", async () => {
//       //   const cookie = await login();
//       //   const response = await request(app)
//       //     .get("/budget/categories")
//       //     .set("Authorization", `Bearer ${cookie}`);
//
//       //   expect(response.status).toBe(200);
//       // });
//     });
//   });
