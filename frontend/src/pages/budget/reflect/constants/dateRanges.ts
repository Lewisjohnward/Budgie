export const DEFAULT_DATE_RANGE = "This month" as const;

export const DATE_RANGE_OPTIONS = [
  DEFAULT_DATE_RANGE,
  "Last 3 Months",
  "Last 6 Months",
  "Last 12 Months",
  "Year To Date",
  "Last Year",
  "All Dates",
] as const;

export type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];
