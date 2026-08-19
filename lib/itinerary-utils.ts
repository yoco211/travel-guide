import { parseItinerary } from "./parse-itinerary";
import type { GuideSection, TripActivity, TripDay } from "../types";

export interface ItineraryConflict {
  severity: "error" | "warning";
  dayId: string;
  activityIds: string[];
  message: string;
}

function addDays(date: string, offset: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setUTCDate(parsed.getUTCDate() + offset);
  return parsed.toISOString().slice(0, 10);
}

function cleanText(value: string): string {
  return value
    .replace(/\*\*/g, "")
    .replace(/^\s*[-–—•]+\s*/, "")
    .replace(/^\s*[:：]+\s*/, "")
    .trim();
}

function createActivity(dayNumber: number, index: number, block: { period: TripActivity["period"]; content: string }): TripActivity {
  const notes = cleanText(block.content);
  const firstLine = notes.split(/\r?\n/).find(Boolean) || "行程安排";

  return {
    id: `day-${dayNumber}-activity-${index + 1}`,
    title: firstLine.slice(0, 80),
    period: block.period,
    notes,
  };
}

export function buildItineraryFromGuide(
  sections: GuideSection[],
  startDate: string
): TripDay[] {
  const itinerarySection = sections.find(
    (section) => section.id === "itinerary" || /行程|itinerary/i.test(section.title)
  );
  if (!itinerarySection) return [];

  const parsedDays = parseItinerary(itinerarySection.content, "zh");
  if (!parsedDays) return [];

  return parsedDays.map((day) => ({
    id: `day-${day.dayNumber}`,
    date: addDays(startDate, day.dayNumber - 1),
    label: day.label,
    activities: day.timeBlocks.map((block, index) => createActivity(day.dayNumber, index, block)),
  }));
}

export function reorderActivities(
  day: TripDay,
  fromIndex: number,
  toIndex: number
): TripDay {
  if (
    fromIndex < 0 ||
    fromIndex >= day.activities.length ||
    toIndex < 0 ||
    toIndex >= day.activities.length ||
    fromIndex === toIndex
  ) {
    return { ...day, activities: [...day.activities] };
  }

  const activities = [...day.activities];
  const [moved] = activities.splice(fromIndex, 1);
  activities.splice(toIndex, 0, moved);
  return { ...day, activities };
}

function toMinutes(value?: string): number | undefined {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return undefined;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return undefined;
  return hours * 60 + minutes;
}

export function findItineraryConflicts(days: TripDay[]): ItineraryConflict[] {
  const errors: ItineraryConflict[] = [];
  const warnings: ItineraryConflict[] = [];

  for (const day of days) {
    const timedActivities = day.activities
      .map((activity) => ({
        activity,
        start: toMinutes(activity.startTime),
        end: toMinutes(activity.endTime),
      }))
      .filter((item): item is typeof item & { start: number; end: number } =>
        item.start !== undefined && item.end !== undefined
      );

    for (const item of timedActivities) {
      if (item.end <= item.start) {
        errors.push({
          severity: "error",
          dayId: day.id,
          activityIds: [item.activity.id],
          message: `“${item.activity.title}”的结束时间必须晚于开始时间。`,
        });
      }
    }

    const validActivities = timedActivities
      .filter((item) => item.end > item.start)
      .sort((a, b) => a.start - b.start);

    for (let index = 0; index < validActivities.length - 1; index += 1) {
      const current = validActivities[index];
      const next = validActivities[index + 1];
      if (next.start < current.end) {
        warnings.push({
          severity: "warning",
          dayId: day.id,
          activityIds: [current.activity.id, next.activity.id],
          message: `“${current.activity.title}”与“${next.activity.title}”的时间重叠。`,
        });
      }
    }
  }

  return [...errors, ...warnings];
}
