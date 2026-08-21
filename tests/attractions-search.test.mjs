import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { getAttraction } = await jiti.import("../data/attractions.ts");
const { searchSite } = await jiti.import("../data/search.ts");

test("searching a landmark returns an attraction result linked to its city", () => {
  const results = searchSite("故宫");
  const attraction = results.find(
    (result) => result.kind === "attraction" && result.name === "故宫"
  );

  assert.ok(attraction);
  assert.equal(attraction.cityName, "北京");
  assert.equal(attraction.citySlug, "beijing");
  assert.equal(attraction.category, "历史建筑");
  assert.match(attraction.href, /^\/attractions\//);
});

test("searching a city still returns a destination result", () => {
  const results = searchSite("东京");
  const destination = results.find(
    (result) => result.kind === "destination" && result.name === "东京"
  );

  assert.ok(destination);
  assert.equal(destination.href, "/destinations/tokyo");
});

test("attraction records expose the destination guide they belong to", () => {
  const attraction = getAttraction("forbidden-city");

  assert.ok(attraction);
  assert.equal(attraction.name, "故宫");
  assert.equal(attraction.citySlug, "beijing");
  assert.ok(attraction.description.length > 20);
  assert.ok(attraction.suggestedDuration.length > 0);
});
