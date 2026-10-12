import userEvent, { UserEvent } from "@testing-library/user-event";

let user: ReturnType<typeof userEvent.setup>;

export function setupUser(): UserEvent {
  user = userEvent.setup();
  return user;
}

export function getUser() {
  if (!user) {
    throw new Error("User not initialised. Call setupUser() in beforeEach.");
  }

  return user;
}
