export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "-01");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
