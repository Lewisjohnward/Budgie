import request from "supertest";
import app from "../../app";
import { NormalizedCategories } from "../../features/budget/category/category.types";
import { NormalizedAccounts } from "../../features/budget/account/account.schema";

export const getCategories = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/category")
    .set("Authorization", `Bearer ${cookie}`);
  return res.body as NormalizedCategories;
};

export const getAccounts = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/account")
    .set("Authorization", `Bearer ${cookie}`);
  return res.body as NormalizedAccounts;
};

export const getReadyToAssignMonths = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/category")
    .set("Authorization", `Bearer ${cookie}`);

  const { categories, months } = res.body as NormalizedCategories;

  const readyToAssignCategoryId = Object.values(categories).find(
    (cat) => cat.name === "Ready to Assign",
  )?.id;

  const readyToAssignMonths = Object.values(months).filter(
    (month) => month.categoryId === readyToAssignCategoryId,
  );

  return readyToAssignMonths;
};
