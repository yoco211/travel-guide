import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { calculateBudgetTotal, toggleChecklistItem } = await jiti.import(
  "../lib/trip-personal-utils.ts"
);

test("calculates budget totals and toggles checklist items immutably", () => {
  const items = [
    { id: "one", label: "交通", category: "transport", amount: 120 },
    { id: "two", label: "门票", category: "tickets", amount: 80 },
  ];
  const checklist = [{ id: "passport", label: "护照", done: false }];

  assert.equal(calculateBudgetTotal(items), 200);
  assert.deepEqual(toggleChecklistItem(checklist, "passport"), [{ id: "passport", label: "护照", done: true }]);
  assert.equal(checklist[0].done, false);
});
