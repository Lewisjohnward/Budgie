import app from "../index";
import request from "supertest";

describe("/user/register", () => {
  it("Register user return 200", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test@test.com", username: "test", password: "SecureTestPassword34" });
    expect(response.status).toBe(200);
  });

  it("Register with non unique email return 422", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test@test.com", username: "test", password: "test" });
    expect(response.status).toBe(422);
  });

  it("Register user with invalid password 422", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test1@test.com", username: "test", password: "test" });
    expect(response.status).toBe(422);
  });

  it("Sending incorrect params, 422 response", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test@test.com", password: "test" });
    expect(response.status).toBe(422);
  });

  it("Sending malformed email, 422 response", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test.com", username: "test", password: "test" });
    expect(response.status).toBe(422);
  });
});
