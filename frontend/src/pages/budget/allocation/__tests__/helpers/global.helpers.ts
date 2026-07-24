import { getUser } from "./user";

export async function pressEscape() {
  await getUser().keyboard("{Escape}");
}
