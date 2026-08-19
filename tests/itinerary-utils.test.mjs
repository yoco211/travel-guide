import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const {
  buildItineraryFromGuide,
  findItineraryConflicts,
  reorderActivities,
} = await jiti.import("../lib/itinerary-utils.ts");

test("converts an AI itinerary section into dated editable trip days", () => {
  const days = buildItineraryFromGuide(
    [{
      id: "itinerary",
      title: "每日行程",
      content: "**第1天：** 上午：浅草寺\n下午：上野公园\n晚上：居酒屋\n\n**第2天：** 全天：涩谷与表参道",
      order: 1,
    }],
    "2026-09-01"
  );

  assert.equal(days.length, 2);
  assert.equal(days[0].date, "2026-09-01");
  assert.equal(days[1].date, "2026-09-02");
  assert.equal(days[0].activities.length, 3);
  assert.equal(days[0].activities[0].period, "morning");
  assert.equal(days[0].activities[0].title, "浅草寺");
  assert.equal(days[1].activities[0].period, "all-day");
});

test("reorders activities without mutating the original day", () => {
  const day = {
    id: "day-1",
    date: "2026-09-01",
    label: "第1天",
    activities: [
      { id: "a", title: "A", period: "morning" },
      { id: "b", title: "B", period: "afternoon" },
      { id: "c", title: "C", period: "evening" },
    ],
  };

  const reordered = reorderActivities(day, 2, 0);
  assert.deepEqual(reordered.activities.map((activity) => activity.id), ["c", "a", "b"]);
  assert.deepEqual(day.activities.map((activity) => activity.id), ["a", "b", "c"]);
});

test("reports invalid times and overlapping activities on the same day", () => {
  const conflicts = findItineraryConflicts([{
    id: "day-1",
    date: "2026-09-01",
    label: "第1天",
    activities: [
      { id: "a", title: "早餐", period: "morning", startTime: "10:00", endTime: "09:30" },
      { id: "b", title: "博物馆", period: "morning", startTime: "10:15", endTime: "12:00" },
      { id: "c", title: "公园", period: "morning", startTime: "11:30", endTime: "13:00" },
    ],
  }]);

  assert.equal(conflicts.filter((conflict) => conflict.severity === "error").length, 1);
  assert.equal(conflicts.filter((conflict) => conflict.severity === "warning").length, 1);
  assert.deepEqual(conflicts[1].activityIds, ["b", "c"]);
});
