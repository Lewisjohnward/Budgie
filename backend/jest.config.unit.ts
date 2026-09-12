import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  clearMocks: true,
  collectCoverage: true,
  verbose: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules"],
  coverageProvider: "v8",
  moduleDirectories: ["node_modules", "src"],
  testPathIgnorePatterns: ["/src/__test__/"],
  setupFiles: ["<rootDir>/jest.setup.unit.ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};

export default config;
