import "@testing-library/jest-dom";
import { vi, afterEach, beforeEach } from "vitest";

beforeEach(() => {
  vi.setSystemTime(new Date("2026-07-15"));
});

afterEach(() => {
  vi.useRealTimers();
});
