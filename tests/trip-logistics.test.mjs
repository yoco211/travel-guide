import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createStayRecord, createTransportSegment } = await jiti.import(
  "../lib/trip-logistics.ts"
);

test("creates transport and stay records with stable local ids", () => {
  const now = new Date("2026-08-19T00:00:00.000Z");
  const transport = createTransportSegment("东京", "京都", "train", now);
  const stay = createStayRecord("京都町家", "祇园", "2026-09-03", "2026-09-05", now);

  assert.match(transport.id, /^transport-/);
  assert.deepEqual(
    { from: transport.from, to: transport.to, mode: transport.mode },
    { from: "东京", to: "京都", mode: "train" }
  );
  assert.match(stay.id, /^stay-/);
  assert.equal(stay.checkIn, "2026-09-03");
  assert.equal(stay.checkOut, "2026-09-05");
});
