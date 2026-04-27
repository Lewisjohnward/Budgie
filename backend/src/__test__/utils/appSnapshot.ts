import request from "supertest";
import app from "../../app";
import { BudgetHydrationModel } from "../../features/budget/queries/hydration/hydration.types";

export const getAppSnapshot = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/snapshot")
    .set("Authorization", `Bearer ${cookie}`);

  return res;
};

export const getAppSnapshotBody = async (
  cookie: string
): Promise<BudgetHydrationModel> => {
  const res = await getAppSnapshot(cookie);
  return res.body;
};
