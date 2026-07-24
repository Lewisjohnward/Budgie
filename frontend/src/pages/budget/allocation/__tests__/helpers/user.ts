import userEvent from "@testing-library/user-event";

let user: ReturnType<typeof userEvent.setup>;

export function setupUser() {
  user = userEvent.setup();
}

export function getUser() {
  if (!user) {
    throw new Error("User not initialised. Call setupUser() in beforeEach.");
  }

  return user;
}
