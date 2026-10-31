import { CURRENCY_META, type Currency } from "@/lib/types";

const DAY_MS = 86_400_000;

export function parseISODate(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function addDays(value: string, days: number): string {
  return toISODate(new Date(parseISODate(value).getTime() + days * DAY_MS));
}

export function subtractDays(value: string, days: number): string {
  return addDays(value, -days);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / DAY_MS);
}

export function daysUntil(value: string, now = new Date()): number {
  return daysBetween(todayISO(now), value);
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(
    parseISODate(value),
  );
}

export function formatShortDate(value: string): string {
  return formatDate(value, { month: "short", day: "numeric" });
}

export function formatMonth(value: string): string {
  return formatDate(value, { month: "long", year: "numeric" });
}

export function formatWeekday(value: string): string {
  return formatDate(value, { weekday: "long" });
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  options: { compact?: boolean; maximumFractionDigits?: number } = {},
): string {
  const meta = CURRENCY_META[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    notation: options.compact ? "compact" : "standard",
    maximumFractionDigits:
      options.maximumFractionDigits ?? (options.compact ? 1 : amount % 1 === 0 ? 0 : 2),
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function daysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `In ${days} days`;
  if (days < 60) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

export function relativeDueLabel(dueDate: string, now = new Date()): string {
  const difference = daysBetween(todayISO(now), dueDate);
  if (difference < 0) return `${Math.abs(difference)}d overdue`;
  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";
  return `Due in ${difference}d`;
}
