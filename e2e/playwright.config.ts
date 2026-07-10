import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  workers: 1,

  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },

  webServer: [
    {
      command: "npm run e2e:server",
      cwd: "../backend",
      url: "http://localhost:8001",
      // reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev:e2e",
      cwd: "../frontend",
      url: "http://localhost:5174",
      // reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
