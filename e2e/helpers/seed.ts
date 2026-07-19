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

export async function seed<T>(
  request: APIRequestContext,
  seedName: string
): Promise<T> {
  const response = await request.post(`${API_URL}/__test__/seed/${seedName}`);

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(
      `Failed to seed '${seedName}': ${response.status()} ${body}`
    );
  }

  const body = (await response.json()) as SeedResponse<T>;
  return body.credentials;
}
