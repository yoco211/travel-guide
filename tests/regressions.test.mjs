import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { getLocalISODate, getDefaultTripDates } = await jiti.import(
  "../lib/utils.ts"
);
const { getSearchNavigation } = await jiti.import("../lib/search.ts");
const { getImageUrl } = await jiti.import("../lib/image-url.ts");

test("formats dates using the local calendar instead of UTC", () => {
  const localDate = new Date(2026, 7, 19, 0, 30, 0);

  assert.equal(getLocalISODate(localDate), "2026-08-19");
});

test("default trip dates are calculated from the supplied current date", () => {
  assert.deepEqual(
    getDefaultTripDates(new Date(2020, 0, 1, 12, 0, 0)),
    { from: "2020-02-08", to: "2020-02-14" }
  );
});

test("Enter submits a search even when there are no suggestions", () => {
  assert.deepEqual(getSearchNavigation("不存在的目的地", [], -1), {
    kind: "search",
    query: "不存在的目的地",
  });
});

test("Enter opens the highlighted destination when one is selected", () => {
  assert.deepEqual(
    getSearchNavigation("东京", [{ slug: "tokyo" }], 0),
    { kind: "destination", slug: "tokyo" }
  );
});

test("rejects the retired dynamic Unsplash source URL", () => {
  assert.equal(
    getImageUrl("https://source.unsplash.com/800x600/?tokyo-shibuya-sensoji"),
    null
  );
});

test("keeps a stored destination image URL", () => {
  const imageUrl =
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80";

  assert.equal(getImageUrl(imageUrl), imageUrl);
});
