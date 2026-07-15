import { setupServer } from "msw/node";
import { deleteCategoryHandlers } from "./deleteCategory.msw";

export const server = setupServer(...deleteCategoryHandlers);
