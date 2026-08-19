import { validateTripPlan } from "./trip-schema";
import type { TripActivity, TripPlan } from "../types";

const EXPORT_FORMAT = "travelguide-trip-export";

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function dateOnly(date: string): string {
  return date.replace(/-/g, "");
}

function addDays(date: string, offset: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + offset);
  return parsed.toISOString().slice(0, 10);
}

function timeOnly(time?: string): string | undefined {
  return time && /^\d{2}:\d{2}$/.test(time) ? time.replace(":", "") + "00" : undefined;
}

function activityTimeLabel(activity: TripActivity): string {
  if (activity.startTime && activity.endTime) return `${activity.startTime}-${activity.endTime}`;
  if (activity.startTime) return `${activity.startTime}开始`;
  return "时间待定";
}

export function tripToMarkdown(trip: TripPlan): string {
  const lines = [
    `# ${trip.title}`,
    "",
    `- 路线：${trip.request.origin} → ${trip.request.destination}`,
    `- 日期：${trip.request.dates.from} 至 ${trip.request.dates.to}`,
    `- 风格：${trip.request.travelStyle}`,
    "",
    "## 每日行程",
    "",
  ];

  if (trip.itinerary.length === 0) lines.push("暂未整理每日行程。", "");
  for (const day of trip.itinerary) {
    lines.push(`## ${day.label} · ${day.date}`, "");
    for (const activity of day.activities) {
      const detail = [
        activityTimeLabel(activity),
        activity.location,
      ].filter(Boolean).join(" · ");
      lines.push(`- **${activity.title}**（${detail}）`);
      if (activity.notes) lines.push(`  - ${activity.notes.replace(/\r?\n/g, "\n  - ")}`);
    }
    lines.push("");
  }

  lines.push("## 预算", "");
  if (trip.budget.items.length === 0) {
    lines.push("暂未记录预算。", "");
  } else {
    for (const item of trip.budget.items) lines.push(`- ${item.label}：${item.amount.toLocaleString()} ${trip.budget.currency}`);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export function tripToICS(trip: TripPlan): string {
  const timestamp = new Date(trip.updatedAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TravelGuide//Trip Planner//ZH",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcs(trip.title)}`,
  ];

  for (const day of trip.itinerary) {
    for (const activity of day.activities) {
      const startTime = timeOnly(activity.startTime);
      const endTime = timeOnly(activity.endTime);
      lines.push("BEGIN:VEVENT", `UID:${escapeIcs(`${trip.id}-${activity.id}@travel-guide`)}`, `DTSTAMP:${timestamp}`);
      if (startTime && endTime) {
        lines.push(`DTSTART:${dateOnly(day.date)}T${startTime}`, `DTEND:${dateOnly(day.date)}T${endTime}`);
      } else {
        lines.push(`DTSTART;VALUE=DATE:${dateOnly(day.date)}`, `DTEND;VALUE=DATE:${dateOnly(addDays(day.date, 1))}`);
      }
      lines.push(`SUMMARY:${escapeIcs(activity.title)}`);
      if (activity.location) lines.push(`LOCATION:${escapeIcs(activity.location)}`);
      if (activity.notes) lines.push(`DESCRIPTION:${escapeIcs(activity.notes)}`);
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function serializeTrips(trips: TripPlan[]): string {
  return JSON.stringify({
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    trips,
  }, null, 2);
}

export function parseTripsImport(raw: string): TripPlan[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("导入文件不是有效的 JSON。", { cause: undefined });
  }

  const candidates = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && "trips" in parsed && Array.isArray(parsed.trips)
      ? parsed.trips
      : [];

  const trips = candidates.flatMap((candidate) => {
    const result = validateTripPlan(candidate);
    return result.success ? [result.data] : [];
  });

  if (trips.length === 0) throw new Error("没有找到有效的行程数据。");
  return trips;
}
