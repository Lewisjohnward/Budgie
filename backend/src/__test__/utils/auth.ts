import request from "supertest";
import app from "../../app";
import { NormalisedCategoryData } from "../../features/budget/category/core/category.types";
import { prisma } from "../../shared/prisma/client";

export const testUser = {
  email: "test@test.com",
  password: "testpasswordABC$",
};

export const login = async (
  user: { email: string; password: string } = testUser
) => {
  const res = await request(app).post("/user/auth/login").send(user);
  const cookie = res.body;

  return cookie;
};

export const registerUser = async (
  user: { email: string; password: string } = testUser
) => {
  const res = await request(app).post("/user/auth/register").send(user);

  const cookie = res.body;

  // Create a test category group
  await request(app)
    .post("/budget/categorygroup")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      name: "test category group",
    });

  const categoriesResponse = await request(app)
    .get("/budget/category")
    .set("Authorization", `Bearer ${cookie}`);

  const responseBody = categoriesResponse.body as NormalisedCategoryData;

  const { categoryGroups } = responseBody;

  const testCategoryGroup = Object.values(categoryGroups).find(
    (categoryGroup) => categoryGroup.name === "test category group"
  );

  if (!testCategoryGroup) throw new Error("Unable to find test category group");

  // Create a test category for the user
  await request(app)
    .post("/budget/category")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      categoryGroupId: testCategoryGroup.id,
      name: "test category",
    });

  // Create another test category for the user
  await request(app)
    .post("/budget/category")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      categoryGroupId: testCategoryGroup.id,
      name: "another test category",
    });

  const category = await prisma.category.findFirstOrThrow({
    where: {
      name: "test category",
    },
  });

  const accountsRes = await request(app)
    .get("/budget/account")
    .set("Authorization", `Bearer ${cookie}`);

  const catRes = await request(app)
    .get("/budget/category")
    .set("Authorization", `Bearer ${cookie}`);

  // console.log("WHY ARE THESE 2 DIFFERENT??");
  // console.log(accountsRes.body);
  // console.log(catRes.body);
};
