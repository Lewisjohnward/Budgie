import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: "./",
  test: {
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    globals: true,
    include: ["src/**/*.int.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
