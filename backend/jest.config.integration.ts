import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/src/__test__/setup/setup.ts",
  globalTeardown: "<rootDir>/src/__test__/setup/teardown.ts",
  setupFilesAfterEnv: ["<rootDir>/src/__test__/setup/setupTests.ts"],
};

export default config;
