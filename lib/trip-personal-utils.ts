import type { BudgetItem, TripChecklistItem } from "../types";

export function calculateBudgetTotal(items: BudgetItem[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function toggleChecklistItem(items: TripChecklistItem[], itemId: string): TripChecklistItem[] {
  return items.map((item) => item.id === itemId ? { ...item, done: !item.done } : { ...item });
}
