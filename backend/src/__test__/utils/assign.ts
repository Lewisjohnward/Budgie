import app from "../../app";
import request from "supertest";
import { DomainMonth } from "../../features/budget/category/category.types";

export async function getMonthsForCategories(
  cookie: string,
  categoryIds: string[]
): Promise<DomainMonth[]> {
  const res = await request(app)
    .get("/budget/assign")
    .set("Authorization", `Bearer ${cookie}`)
    .query({
      categoryIds,
    });

  if (res.status >= 400) {
    const err: any = new Error(res.body?.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return res.body as DomainMonth[];
}
