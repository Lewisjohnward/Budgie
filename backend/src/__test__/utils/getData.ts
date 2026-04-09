import request from "supertest";
import app from "../../app";
import { type NormalisedData } from "../../features/budget/category/core/category.types";
import { type NormalisedAccounts } from "../../features/budget/account/account.types";

export const getCategories = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/category")
    .set("Authorization", `Bearer ${cookie}`);
  return res.body as NormalisedData;
};

export const getAccounts = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/account")
    .set("Authorization", `Bearer ${cookie}`);
  return res.body as NormalisedAccounts;
};

export const getReadyToAssignMonths = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/category")
    .set("Authorization", `Bearer ${cookie}`);

  const { categories, months } = res.body as NormalisedData;

  const readyToAssignCategoryId = Object.values(categories).find(
    (cat) => cat.name === "Ready to Assign"
  )?.id;

  const readyToAssignMonths = Object.values(months).filter(
    (month) => month.categoryId === readyToAssignCategoryId
  );

  return readyToAssignMonths;
};
