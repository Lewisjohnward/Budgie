import { afterEach } from "@jest/globals";
import { clearDatabase } from "../utils/clearDatabase";

afterEach(async () => {
  await clearDatabase();
});
