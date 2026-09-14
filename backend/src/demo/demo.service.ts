import { login } from "./application/services/login";
import { reset } from "./application/services/reset";
import { seedDemo } from "./application/services/seed";

export const demoService = {
  reset,
  seed: seedDemo,
  login,
};
