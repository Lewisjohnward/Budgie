import { request } from "@playwright/test";

const API_URL = "http://localhost:8001";

export async function resetDatabase() {
  const context = await request.newContext();

  const response = await context.post(`${API_URL}/__test__/reset`);

  if (!response.ok()) {
    throw new Error(`Failed to reset database: ${response.status()}`);
  }

  await context.dispose();
}
