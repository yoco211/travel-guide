import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createTripPlan, duplicateTrip, filterTrips, getNextTrip } = await jiti.import(
  "../lib/trip-utils.ts"
);

const baseRequest = {
  origin: "北京",
  destination: "东京",
  dates: { from: "2026-09-01", to: "2026-09-05" },
  budget: "mid-range",
  interests: ["food"],
  travelStyle: "solo",
  language: "zh",
};

const guide = {
  destination: "东京",
  generatedAt: "2026-08-19T00:00:00.000Z",
  sections: [],
  metadata: { model: "test" },
};

function makeTrip(overrides = {}, now = "2026-08-19T00:00:00.000Z") {
  return createTripPlan(
    { ...baseRequest, ...overrides.request },
    { ...guide, ...overrides.guide },
    new Date(now)
  );
}

test("duplicates a trip with a new identity and editable title", () => {
  const original = makeTrip();
  const copy = duplicateTrip(original, new Date("2026-08-20T00:00:00.000Z"));

  assert.notEqual(copy.id, original.id);
  assert.equal(copy.title, "东京之旅 副本");
  assert.equal(copy.createdAt, "2026-08-20T00:00:00.000Z");
  assert.equal(copy.updatedAt, "2026-08-20T00:00:00.000Z");
  assert.deepEqual(copy.request, original.request);
});

test("filters trips by destination, title, budget, and free text", () => {
  const tokyo = makeTrip();
  const paris = makeTrip(
    {
      request: {
        destination: "巴黎",
        budget: "luxury",
      },
      guide: { destination: "巴黎" },
    },
    "2026-08-21T00:00:00.000Z"
  );

  assert.deepEqual(filterTrips([tokyo, paris], "巴黎"), [paris]);
  assert.deepEqual(filterTrips([tokyo, paris], "luxury"), [paris]);
  assert.deepEqual(filterTrips([tokyo, paris], "东京之旅"), [tokyo]);
  assert.deepEqual(filterTrips([tokyo, paris], ""), [paris, tokyo]);
});

test("selects the next trip by departure date", () => {
  const past = makeTrip(
    { request: { dates: { from: "2026-08-01", to: "2026-08-03" } } },
    "2026-08-01T00:00:00.000Z"
  );
  const next = makeTrip(
    { request: { dates: { from: "2026-09-01", to: "2026-09-05" } } },
    "2026-08-02T00:00:00.000Z"
  );

  assert.equal(getNextTrip([past, next], "2026-08-19"), next);
});
