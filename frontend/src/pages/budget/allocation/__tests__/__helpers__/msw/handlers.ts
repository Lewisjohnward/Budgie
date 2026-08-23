import { http, HttpResponse } from "msw";
import { getSnapshot } from "./state";

const API_URL = import.meta.env.VITE_API_URL;

export const handlers = [
  http.get(`${API_URL}/budget/snapshot`, () => {
    return HttpResponse.json(getSnapshot());
  }),

  http.get(`${API_URL}/budget/categories`, () => {
    return HttpResponse.json(getSnapshot());
  }),

  http.get(`${API_URL}/budget/account`, () => {
    return HttpResponse.json(getSnapshot());
  }),
];
