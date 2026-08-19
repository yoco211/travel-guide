import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { formatDestinationTime, getDestinationInsight, getDateKind } = await jiti.import(
  "../lib/trip-insights.ts"
);

test("resolves destination coordinates and formats its local time", () => {
  const insight = getDestinationInsight("东京");
  assert.equal(insight?.name, "东京");
  assert.deepEqual(insight?.coordinates, { lat: 35.6762, lng: 139.6503 });
  assert.match(formatDestinationTime("UTC+9", new Date("2026-08-19T00:00:00.000Z")), /09:00/);
});

test("identifies weekends for lightweight travel alerts", () => {
  assert.equal(getDateKind("2026-08-22"), "周末");
  assert.equal(getDateKind("2026-08-21"), "工作日");
});
