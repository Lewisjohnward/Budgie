import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/src/__test__/setup/setup.ts",
  globalTeardown: "<rootDir>/src/__test__/setup/teardown.ts",
  setupFilesAfterEnv: ["<rootDir>/src/__test__/setup/setupTests.ts"],
  maxWorkers: 1,
  testRunner: "jest-circus/runner",
  verbose: true,
};

export default config;
