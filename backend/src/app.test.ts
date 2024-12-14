import request from "supertest";
import app from "./app";

describe("Test application", () => {
  it("Not found for site 404", async () => {
    const res = await request(app).get("/wrong-path");
    expect(res.statusCode).toEqual(404);
  });

  it("Health check route returns valid response", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ ping: "pong" });
  });
});

// afterAll(async () => {
//   await db.end()
// })
