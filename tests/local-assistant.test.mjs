import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { buildLocalAssistantAnswer } = await jiti.import("../lib/local-assistant.ts");

test("answers local questions using saved trip data without a network call", () => {
  const answer = buildLocalAssistantAnswer({
    title: "东京之旅",
    budget: { currency: "JPY", items: [{ id: "one", category: "food", label: "晚餐", amount: 3000 }] },
    itinerary: [{ id: "day-1", date: "2026-09-01", label: "第1天", activities: [{ id: "a", title: "浅草寺", period: "morning" }] }],
    checklist: [{ id: "passport", label: "护照", done: false }],
  }, "预算和清单怎么样？");

  assert.match(answer, /3,000/);
  assert.match(answer, /护照/);
});
