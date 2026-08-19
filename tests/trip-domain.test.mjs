import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createTripPlan, touchTrip } = await jiti.import(
  "../lib/trip-utils.ts"
);
const { validateTripPlan } = await jiti.import("../lib/trip-schema.ts");
const {
  deleteStoredTrip,
  listStoredTrips,
  replaceStoredTrips,
  saveStoredTrip,
} = await jiti.import("../lib/trip-storage.ts");

const request = {
  origin: "北京",
  destination: "东京",
  dates: { from: "2026-09-01", to: "2026-09-05" },
  budget: "mid-range",
  interests: ["food", "culture"],
  travelStyle: "solo",
  language: "zh",
  additionalNotes: "少走路",
};

const guide = {
  destination: "东京",
  generatedAt: "2026-08-19T00:00:00.000Z",
  sections: [
    { id: "overview", title: "目的地概览", content: "东京攻略", order: 1 },
  ],
  metadata: { model: "test" },
};

function createMemoryStorage() {
  let value = null;
  return {
    getItem() {
      return value;
    },
    setItem(_key, nextValue) {
      value = nextValue;
    },
    removeItem() {
      value = null;
    },
  };
}

test("creates a versioned trip plan from a planner request and guide", () => {
  const plan = createTripPlan(request, guide, new Date("2026-08-19T00:00:00.000Z"));

  assert.equal(plan.schemaVersion, 1);
  assert.match(plan.id, /^trip-/);
  assert.equal(plan.title, "东京之旅");
  assert.deepEqual(plan.request, request);
  assert.deepEqual(plan.guide, guide);
  assert.deepEqual(plan.itinerary, []);
  assert.deepEqual(plan.budget, { currency: "JPY", items: [] });
  assert.equal(plan.createdAt, "2026-08-19T00:00:00.000Z");
  assert.equal(plan.updatedAt, "2026-08-19T00:00:00.000Z");
});

test("validates the trip schema and rejects malformed imports", () => {
  const plan = createTripPlan(request, guide, new Date("2026-08-19T00:00:00.000Z"));

  assert.equal(validateTripPlan(plan).success, true);
  assert.equal(validateTripPlan({ ...plan, schemaVersion: 2 }).success, false);
  assert.equal(validateTripPlan({ ...plan, request: null }).success, false);
});

test("touches a trip without changing its creation timestamp", () => {
  const plan = createTripPlan(request, guide, new Date("2026-08-19T00:00:00.000Z"));
  const touched = touchTrip(plan, new Date("2026-08-20T00:00:00.000Z"));

  assert.equal(touched.createdAt, plan.createdAt);
  assert.equal(touched.updatedAt, "2026-08-20T00:00:00.000Z");
});

test("stores, lists, replaces, and deletes multiple trips", () => {
  const storage = createMemoryStorage();
  const first = createTripPlan(request, guide, new Date("2026-08-19T00:00:00.000Z"));
  const second = createTripPlan(
    { ...request, destination: "京都" },
    { ...guide, destination: "京都" },
    new Date("2026-08-20T00:00:00.000Z")
  );

  saveStoredTrip(first, storage);
  saveStoredTrip(second, storage);
  assert.deepEqual(
    listStoredTrips(storage).map((trip) => trip.id),
    [second.id, first.id]
  );

  saveStoredTrip({ ...first, title: "东京更新" }, storage);
  assert.equal(listStoredTrips(storage)[1].title, "东京更新");

  deleteStoredTrip(first.id, storage);
  assert.deepEqual(listStoredTrips(storage).map((trip) => trip.id), [second.id]);
});

test("replaces the complete stored trip collection", () => {
  const storage = createMemoryStorage();
  const first = createTripPlan(request, guide, new Date("2026-08-19T00:00:00.000Z"));
  const second = createTripPlan(
    { ...request, destination: "京都" },
    { ...guide, destination: "京都" },
    new Date("2026-08-20T00:00:00.000Z")
  );

  saveStoredTrip(first, storage);
  replaceStoredTrips([second], storage);
  assert.deepEqual(listStoredTrips(storage).map((trip) => trip.id), [second.id]);
});
