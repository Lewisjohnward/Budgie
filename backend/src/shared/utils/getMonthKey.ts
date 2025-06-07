import { roundToStartOfMonth } from "./roundToStartOfMonth";

export const getMonthKey = (date: Date) =>
    roundToStartOfMonth(date).toISOString().slice(0, 7);