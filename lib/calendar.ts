import { addDays, parseISODate } from "@/lib/dates";
import type { Plan } from "@/lib/types";

function icsDate(value: string): string {
  return value.replace(/-/g, "");
}

function stamp(value: string): string {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function fold(line: string): string {
  if (line.length <= 74) return line;
  const chunks: string[] = [];
  let current = line;
  while (current.length > 74) {
    chunks.push(current.slice(0, 74));
    current = ` ${current.slice(74)}`;
  }
  chunks.push(current);
  return chunks.join("\r\n");
}

export function buildCalendarFile(plan: Plan): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Morrow//Event Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICS(plan.brief.eventName)}`,
  ];

  for (const task of plan.timeline) {
    const end = addDays(task.dueDate, 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeICS(task.id)}@morrow.local`,
      `DTSTAMP:${stamp(plan.createdAt)}`,
      `DTSTART;VALUE=DATE:${icsDate(parseISODate(task.dueDate).toISOString().slice(0, 10))}`,
      `DTEND;VALUE=DATE:${icsDate(parseISODate(end).toISOString().slice(0, 10))}`,
      `SUMMARY:${escapeICS(task.title)}`,
      `DESCRIPTION:${escapeICS(task.description)}`,
      `CATEGORIES:${escapeICS(task.category)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

export function downloadCalendar(plan: Plan): void {
  const blob = new Blob([buildCalendarFile(plan)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${plan.brief.eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "morrow-plan"}-milestones.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
