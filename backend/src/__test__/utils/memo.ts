import request from "supertest";
import app from "../../app";

export const LENGTH_ON_SIGNUP = 2;

export const updateMemo = async (
  cookie: string,
  memoId: string,
  updatedContent?: string
) => {
  const res = await request(app)
    .patch(`/budget/memo/${memoId}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      content: updatedContent,
    });

  return res;
};
