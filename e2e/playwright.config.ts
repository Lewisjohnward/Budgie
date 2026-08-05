import { defineConfig } from "@playwright/test";

export default defineConfig({
  workers: 1,

  // reporter: [["./test-reporter.ts"]],

  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "smoke",
      testDir: "./tests/smoke",
    },
    {
      name: "feature",
      testDir: "./tests/features",
      dependencies: ["smoke"],
    },
  ],

  webServer: [
    {
      command: "npm run e2e:server",
      cwd: "../backend",
      url: "http://localhost:8001",
      reuseExistingServer: true,
    },
    {
      command: "npm run dev:e2e",
      cwd: "../frontend",
      url: "http://localhost:5174",
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
