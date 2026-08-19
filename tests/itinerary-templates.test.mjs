import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { BUILT_IN_ITINERARY_TEMPLATES, applyItineraryTemplate } = await jiti.import(
  "../lib/itinerary-templates.ts"
);

test("offers useful built-in itinerary templates", () => {
  assert.ok(BUILT_IN_ITINERARY_TEMPLATES.length >= 3);
  assert.deepEqual(
    BUILT_IN_ITINERARY_TEMPLATES.map((template) => template.id),
    ["city-break", "food-weekend", "family-easy"]
  );
});

test("applies a template to a new start date with independent activity ids", () => {
  const template = BUILT_IN_ITINERARY_TEMPLATES[0];
  const days = applyItineraryTemplate(template, "2026-10-03");

  assert.equal(days[0].date, "2026-10-03");
  assert.equal(days[1].date, "2026-10-04");
  assert.notEqual(days[0].id, template.days[0].id);
  assert.notEqual(days[0].activities[0].id, template.days[0].activities[0].id);
  assert.equal(days[0].activities[0].title, "城市地标与老街");
});
