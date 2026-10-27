import "@testing-library/jest-dom/vitest";
import { vi, afterEach, beforeEach } from "vitest";

// TODO:(lewis 2026-10-27 11:07) this is to prevent a popover error due to not being rendered in a real browser
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock;
beforeEach(() => {
  vi.setSystemTime(new Date("2026-07-15"));
});

afterEach(() => {
  vi.useRealTimers();
});
