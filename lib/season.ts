import type { Destination } from "@/types";

/**
 * Extract month numbers from a bestSeason string.
 * Handles formats like:
 *   "4-5月, 9-10月"  => [4, 5, 9, 10]
 *   "10-4月"          => [10, 11, 12, 1, 2, 3, 4]
 *   "全年皆宜"         => [1..12]
 *   "6-8月 (极昼)"    => [6, 7, 8]
 */
export function parseBestSeasonMonths(bestSeason: string): number[] {
  // Strip parenthetical notes
  const cleaned = bestSeason.replace(/\s*\(.*?\)\s*/g, "").trim();

  // "全年皆宜" => all months
  if (cleaned.includes("全年")) {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  const months = new Set<number>();

  // Match patterns like "4-5月" or "10-4月"
  const rangeRegex = /(\d{1,2})\s*-\s*(\d{1,2})\s*月/g;
  let match: RegExpExecArray | null;

  while ((match = rangeRegex.exec(cleaned)) !== null) {
    const start = parseInt(match[1], 10);
    const end = parseInt(match[2], 10);

    if (start <= end) {
      for (let m = start; m <= end; m++) months.add(m);
    } else {
      // Wrap around: 10-4 => 10, 11, 12, 1, 2, 3, 4
      for (let m = start; m <= 12; m++) months.add(m);
      for (let m = 1; m <= end; m++) months.add(m);
    }
  }

  // Also match single months like "3月"
  const singleRegex = /(?:^|[,\s])(\d{1,2})\s*月/g;
  while ((match = singleRegex.exec(cleaned)) !== null) {
    months.add(parseInt(match[1], 10));
  }

  if (months.size === 0) {
    // If parsing failed entirely, assume all-year
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  return Array.from(months).sort((a, b) => a - b);
}

/** Get current month as 1-12 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/** Check if a destination is in season for the given month */
export function isInSeason(bestSeason: string, month?: number): boolean {
  const m = month ?? getCurrentMonth();
  const months = parseBestSeasonMonths(bestSeason);
  return months.includes(m);
}

/** Get seasonal month name in Chinese */
export function getMonthName(month: number): string {
  const names = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];
  return names[month - 1] ?? `${month}月`;
}

/** Get season emoji for a month */
export function getSeasonEmoji(month: number): string {
  if (month >= 3 && month <= 5) return "🌸";  // Spring
  if (month >= 6 && month <= 8) return "☀️";  // Summer
  if (month >= 9 && month <= 11) return "🍂"; // Autumn
  return "❄️";                                // Winter
}

/** Get season gradient for styling */
export function getSeasonGradient(month: number): string {
  if (month >= 3 && month <= 5) return "from-pink-50 via-rose-50 to-white";
  if (month >= 6 && month <= 8) return "from-amber-50 via-yellow-50 to-white";
  if (month >= 9 && month <= 11) return "from-orange-50 via-amber-50 to-white";
  return "from-sky-50 via-blue-50 to-white";
}

/**
 * Return destinations sorted: in-season first (by popularity),
 * then out-of-season (by popularity).
 */
export function getSeasonalDestinations(
  destinations: Destination[],
  month?: number
): { inSeason: Destination[]; outOfSeason: Destination[] } {
  const m = month ?? getCurrentMonth();

  const inSeason: Destination[] = [];
  const outOfSeason: Destination[] = [];

  for (const dest of destinations) {
    if (isInSeason(dest.bestSeason, m)) {
      inSeason.push(dest);
    } else {
      outOfSeason.push(dest);
    }
  }

  // Sort by popularity descending within each group
  const sortByPop = (a: Destination, b: Destination) => b.popularity - a.popularity;
  inSeason.sort(sortByPop);
  outOfSeason.sort(sortByPop);

  return { inSeason, outOfSeason };
}
