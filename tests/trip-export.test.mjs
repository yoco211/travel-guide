import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createTripPlan } = await jiti.import("../lib/trip-utils.ts");
const { parseTripsImport, serializeTrips, tripToICS, tripToMarkdown } = await jiti.import(
  "../lib/trip-export.ts"
);

const request = {
  origin: "北京",
  destination: "东京",
  dates: { from: "2026-09-01", to: "2026-09-05" },
  budget: "mid-range",
  interests: ["food", "culture"],
  travelStyle: "solo",
  language: "zh",
};

const guide = {
  destination: "东京",
  generatedAt: "2026-08-19T00:00:00.000Z",
  sections: [],
  metadata: { model: "test" },
};

function sampleTrip() {
  const trip = createTripPlan(request, guide, new Date("2026-08-19T00:00:00.000Z"));
  return {
    ...trip,
    title: "东京美食之旅",
    itinerary: [{
      id: "day-1",
      date: "2026-09-01",
      label: "第1天",
      activities: [{
        id: "activity-1",
        title: "浅草寺",
        period: "morning",
        startTime: "09:00",
        endTime: "11:00",
        location: "浅草",
        notes: "提前预约。",
      }],
    }],
  };
}

test("exports a readable markdown itinerary", () => {
  const markdown = tripToMarkdown(sampleTrip());

  assert.match(markdown, /^# 东京美食之旅/m);
  assert.match(markdown, /## 第1天 · 2026-09-01/);
  assert.match(markdown, /浅草寺/);
  assert.match(markdown, /09:00-11:00/);
  assert.match(markdown, /浅草/);
});

test("exports timed itinerary activities as calendar events", () => {
  const ics = tripToICS(sampleTrip());

  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /UID:.*activity-1@travel-guide/);
  assert.match(ics, /DTSTART:20260901T090000/);
  assert.match(ics, /DTEND:20260901T110000/);
  assert.match(ics, /SUMMARY:浅草寺/);
  assert.match(ics, /END:VCALENDAR/);
});

test("round-trips an exported trip collection and rejects invalid imports", () => {
  const trips = [sampleTrip()];
  const serialized = serializeTrips(trips);
  assert.deepEqual(parseTripsImport(serialized), trips);
  assert.deepEqual(parseTripsImport(JSON.stringify({ trips })), trips);
  assert.throws(() => parseTripsImport(JSON.stringify([{ bad: true }])), /没有找到有效的行程/);
});
