describe("Test Config", () => {
  it("Config derived from process.env", () => {
    expect(process.env.PAYLOAD_SECRET).toBe("mysecret");
    expect(process.env.PORT).toBe("3000");
    expect(process.env.DATABASE_URL).toBe("dburl");
  });

  // const fun = () => {
  //   process.env.SECRET_KEY = "keykey";
  //   process.env.PORT = 4000;
  //   process.env.DATABASE_URL = "db_url";
  //   process.env.NODE_ENV = "envy";
  // };
  //
  // const config = require("./config");
  // expect(config.SECRET_KEY).toEqual("keykey");
  // expect(config.PORT).toEqual("keykey");
  // expect(config.getDatabaseUri()).toEqual("keykey");
  //
  // delete process.env.SECRET_KEY;
  // delete process.env.PORT;
  // delete process.env.DATABASE_URL;
  //
  // expect(config.getDatabaseUri()).toEqual("postgresql://postgres@local");
});
