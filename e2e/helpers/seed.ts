import type { APIRequestContext } from "@playwright/test";

const API_URL = "http://localhost:8001";

type SeedResponse<T> = {
  message: string;
  credentials: T;
};

export type TestCredentials = {
  email: string;
  password: string;
};

export async function seedScenario<T>(
  request: APIRequestContext,
  scenario: string
): Promise<T> {
  const response = await request.post(`${API_URL}/__test__/seed/${scenario}`);

  if (!response.ok()) {
    throw new Error(
      `Failed to seed scenario '${scenario}': ${response.status()}`
    );
  }

  const body = (await response.json()) as SeedResponse<T>;
  return body.credentials;
}
