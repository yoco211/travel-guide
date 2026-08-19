import { popularDestinations } from "../data/destinations";

export interface DestinationInsight {
  name: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  bestSeason: string;
}

export function getDestinationInsight(destination: string): DestinationInsight | undefined {
  const item = popularDestinations.find((candidate) => candidate.name === destination || candidate.slug === destination);
  if (!item) return undefined;
  return {
    name: item.name,
    coordinates: item.coordinates,
    timezone: item.timezone,
    bestSeason: item.bestSeason,
  };
}

function timezoneOffsetHours(timezone: string): number {
  const match = timezone.match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/i);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) + Number(match[3] || 0) / 60);
}

export function formatDestinationTime(timezone: string, now = new Date()): string {
  const shifted = new Date(now.getTime() + timezoneOffsetHours(timezone) * 3_600_000);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(shifted);
}

export function getDateKind(date: string): "周末" | "工作日" {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6 ? "周末" : "工作日";
}
