import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: "./",
  test: {
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/*.int.test.ts", "**/*.legacy.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
