import { type APIRequestContext, type Page, request } from "@playwright/test";
import { login } from "./auth";
import { seedScenario, type TestCredentials } from "./seed";

const API_URL = "http://localhost:8001";

export const resetDatabase = async (): Promise<void> => {
  const context = await request.newContext();

  const response = await context.post(`${API_URL}/__test__/reset`);

  if (!response.ok()) {
    throw new Error(`Failed to reset database: ${response.status()}`);
  }

  await context.dispose();
};

export const setupScenario = async (
  page: Page,
  request: APIRequestContext,
  scenario: string
): Promise<void> => {
  const credentials = await seedScenario<TestCredentials>(request, scenario);
  await login(page, credentials);
};
