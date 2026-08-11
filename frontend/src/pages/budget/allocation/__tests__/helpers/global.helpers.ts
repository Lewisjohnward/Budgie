import { getUser } from "./user";

export async function pressEscape() {
  await getUser().keyboard("{Escape}");
}

export async function pressEnter() {
  await getUser().keyboard("{Enter}");
}
