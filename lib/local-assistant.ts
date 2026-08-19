import { calculateBudgetTotal } from "./trip-personal-utils";
import { findItineraryConflicts } from "./itinerary-utils";
import type { BudgetPlan, TripChecklistItem, TripDay } from "../types";

export interface LocalAssistantContext {
  title: string;
  budget: BudgetPlan;
  itinerary: TripDay[];
  checklist?: TripChecklistItem[];
}

export function buildLocalAssistantAnswer(trip: LocalAssistantContext, question: string): string {
  const normalized = question.toLowerCase();
  const total = calculateBudgetTotal(trip.budget.items);
  const unchecked = (trip.checklist ?? []).filter((item) => !item.done).map((item) => item.label);
  const conflicts = findItineraryConflicts(trip.itinerary);
  const parts: string[] = [];

  if (/预算|花费|钱|费用/.test(normalized)) {
    parts.push(`目前记录的预算合计是 ${total.toLocaleString()} ${trip.budget.currency}，共 ${trip.budget.items.length} 项。`);
  }
  if (/清单|行李|带什么|准备/.test(normalized)) {
    parts.push(unchecked.length ? `还没完成的清单有：${unchecked.join("、")}。` : "出行清单已经全部完成了。");
  }
  if (/冲突|时间|安排|优化|轻松/.test(normalized)) {
    if (conflicts.length) parts.push(`目前发现 ${conflicts.length} 个时间提醒，建议先处理每日行程中的重叠或无效时间。`);
    const busyDay = [...trip.itinerary].sort((a, b) => b.activities.length - a.activities.length)[0];
    if (busyDay) parts.push(`${busyDay.label}目前有 ${busyDay.activities.length} 项安排，可以考虑预留用餐和移动时间。`);
  }
  if (parts.length === 0) {
    parts.push(`“${trip.title}”目前有 ${trip.itinerary.length} 天行程。你可以问我预算、清单、时间冲突，或让我帮你找出安排最密集的一天。`);
  }

  return parts.join("\n");
}
