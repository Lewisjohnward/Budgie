import request from "supertest";
import app from "../../app";
import { NormalisedPayees } from "../../features/budget/payee/payee.types";
import {
  CombinePayeesPayload,
  DeletePayeesInBulkPayload,
  EditPayeePayload,
  EditPayeesInBulkPayload,
} from "../../features/budget/payee/payee.schema";

export const getPayees = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/payees")
    .set("Authorization", `Bearer ${cookie}`)
    .expect(200);

  return res.body as NormalisedPayees;
};

export type EditPayeePayloadWithoutUserId = Omit<EditPayeePayload, "userId">;

export const editPayee = async (
  cookie: string,
  payload: EditPayeePayloadWithoutUserId,
  expectCode: number = 200
) => {
  return await request(app)
    .patch("/budget/payees")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload)
    .expect(expectCode);
};

export type DeletePayeesPayloadWithoutUserId = Omit<
  DeletePayeesInBulkPayload,
  "userId"
>;

export const deletePayees = async (
  cookie: string,
  payload: DeletePayeesPayloadWithoutUserId,
  expectCode: number = 200
) => {
  return await request(app)
    .delete("/budget/payees/bulk")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload)
    .expect(expectCode);
};

export type CombinePayeesPayloadWithoutUserId = Omit<
  CombinePayeesPayload,
  "userId"
>;

export const combinePayees = async (
  cookie: string,
  payload: CombinePayeesPayloadWithoutUserId,
  expectCode: number = 200
) => {
  return await request(app)
    .post("/budget/payees/combine")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload)
    .expect(expectCode);
};

export type EditPayeesPayloadWithoutUserId = Omit<
  EditPayeesInBulkPayload,
  "userId"
>;

export const editPayees = async (
  cookie: string,
  payload: EditPayeesPayloadWithoutUserId,
  expectCode: number = 200
) => {
  return await request(app)
    .patch("/budget/payees/bulk")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload)
    .expect(expectCode);
};

export const getPayeeByName = async (
  cookie: string,
  payeeName: string
) => {
  const { payees } = await getPayees(cookie);
  const payeesArray = Object.values(payees);
  const payee = payeesArray.find((p) => p.name === payeeName);

  if (!payee) {
    throw new Error(`Unable to find payee with name: ${payeeName}`);
  }

  return payee;
};
