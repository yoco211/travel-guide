/**
 * Types for parsed itinerary data
 */
export interface TimeBlock {
  period: "morning" | "afternoon" | "evening" | "all-day" | "other";
  label: string;
  content: string;
}

export interface DayEntry {
  dayNumber: number;
  label: string;
  timeBlocks: TimeBlock[];
}

/** Block icons for rendering */
export const PERIOD_ICONS: Record<TimeBlock["period"], string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
  "all-day": "📋",
  other: "📍",
};

/** Block background classes for visual distinction */
export const PERIOD_BG: Record<TimeBlock["period"], string> = {
  morning: "bg-amber-50 border-l-amber-400",
  afternoon: "bg-blue-50 border-l-blue-400",
  evening: "bg-indigo-50 border-l-indigo-400",
  "all-day": "bg-emerald-50 border-l-emerald-400",
  other: "bg-surface-50 border-l-surface-300",
};

const TIME_LABELS = {
  zh: {
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    noon: "中午",
    allDay: "全天",
  },
  en: {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    noon: "Noon",
    allDay: "All Day",
  },
};

type Lang = "zh" | "en";

/**
 * Detect which time period a text block belongs to.
 */
function detectPeriod(text: string, lang: Lang): TimeBlock["period"] {
  const labels = TIME_LABELS[lang];
  const lower = text.toLowerCase();

  if (
    lower.includes(labels.morning.toLowerCase()) ||
    lower.startsWith("上午") ||
    lower.startsWith("morning")
  ) {
    return "morning";
  }
  if (
    lower.includes(labels.afternoon.toLowerCase()) ||
    lower.startsWith("下午") ||
    lower.startsWith("afternoon")
  ) {
    return "afternoon";
  }
  if (
    lower.includes(labels.evening.toLowerCase()) ||
    lower.startsWith("晚上") ||
    lower.startsWith("evening")
  ) {
    return "evening";
  }
  if (
    lower.includes(labels.allDay.toLowerCase()) ||
    lower.startsWith("全天") ||
    lower.startsWith("all day")
  ) {
    return "all-day";
  }
  return "other";
}

/**
 * Parse a time block header and content from a chunk of text.
 */
function parseTimeBlocks(dayText: string, lang: Lang): TimeBlock[] {
  const labels = TIME_LABELS[lang];

  // Build a regex to split by time period keywords
  const pattern =
    lang === "zh"
      ? /(?:上午|下午|晚上|中午|全天)\b/
      : /(?:Morning|Afternoon|Evening|Noon|All\s*Day)\b/i;

  const parts = dayText.split(pattern);
  const matches = dayText.match(new RegExp(pattern.source, "gi")) || [];

  if (matches.length === 0) {
    // No time blocks found — treat entire content as one block
    return [
      {
        period: detectPeriod(dayText, lang),
        label: lang === "zh" ? "行程" : "Plan",
        content: dayText.trim(),
      },
    ];
  }

  const blocks: TimeBlock[] = [];
  // matches[i] is the header for parts[i+1]
  for (let i = 0; i < matches.length; i++) {
    const header = matches[i].trim();
    const content = (parts[i + 1] || "").trim();
    if (!content) continue;

    const period = detectPeriod(header, lang);
    blocks.push({
      period,
      label: header,
      content,
    });
  }

  // If there's content before the first match, prepend it
  if (parts[0]?.trim()) {
    blocks.unshift({
      period: "other",
      label: lang === "zh" ? "概述" : "Overview",
      content: parts[0].trim(),
    });
  }

  return blocks;
}

/**
 * Parse markdown itinerary content into structured DayEntry[].
 *
 * Handles formats like:
 *   "**第1天：** 上午... 下午... 晚上..."
 *   "**Day 1:** Morning... Afternoon..."
 *   "### 第1天\n上午...\n下午..."
 *
 * Returns null if no day structure is detected — caller should
 * fall back to rendering raw markdown.
 */
export function parseItinerary(
  content: string,
  language: Lang = "zh"
): DayEntry[] | null {
  if (!content?.trim()) return null;

  const isZh = language === "zh";
  const dayPattern = isZh
    ? /(?:第\s*(\d+)\s*天|Day\s+(\d+))/gi
    : /(?:Day\s+(\d+)|第\s*(\d+)\s*天)/gi;

  // Split by day markers
  const dayMatches: Array<{ index: number; endIndex: number; dayNum: number; raw: string }> = [];
  let dm: RegExpExecArray | null;

  // Clone the regex because it has the 'g' flag
  const regex = new RegExp(dayPattern.source, dayPattern.flags);
  while ((dm = regex.exec(content)) !== null) {
    const dayNum = parseInt(dm[1] || dm[2], 10);
    if (!isNaN(dayNum)) {
      dayMatches.push({
        index: dm.index,
        endIndex: dm.index + dm[0].length,
        dayNum,
        raw: dm[0],
      });
    }
  }

  if (dayMatches.length === 0) {
    // Try to find any day-like structure
    const hasAnyDay = /第\s*\d+\s*天|Day\s+\d+/i.test(content);
    if (!hasAnyDay) return null;

    // Single day with markers but no clear split
    const blocks = parseTimeBlocks(content, language);
    return blocks.length > 0
      ? [{ dayNumber: 1, label: isZh ? "第1天" : "Day 1", timeBlocks: blocks }]
      : null;
  }

  const days: DayEntry[] = [];

  for (let i = 0; i < dayMatches.length; i++) {
    const current = dayMatches[i];
    const next = dayMatches[i + 1];

    // Extract content between this day marker and the next (or end of string)
    const startIdx = current.endIndex;
    const endIdx = next ? next.index : content.length;
    let dayText = content.slice(startIdx, endIdx).trim();

    // Clean up markdown headers (##, **, etc.)
    dayText = dayText
      .replace(/^[\s*#\-—]+/, "")
      .replace(/\*\*/g, "")
      .trim();

    const blocks = parseTimeBlocks(dayText, language);

    days.push({
      dayNumber: current.dayNum,
      label: isZh ? `第${current.dayNum}天` : `Day ${current.dayNum}`,
      timeBlocks: blocks,
    });
  }

  return days.length > 0 ? days : null;
}
