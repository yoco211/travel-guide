import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { popularDestinations } = await jiti.import("../data/destinations.ts");
const { destinationImageManifest, getDestinationImage } = await jiti.import(
  "../data/destination-images.ts"
);

test("every destination has a curated image manifest entry", () => {
  assert.equal(Object.keys(destinationImageManifest).length, popularDestinations.length);

  for (const destination of popularDestinations) {
    const image = getDestinationImage(destination.slug);
    assert.ok(image, `missing image manifest for ${destination.slug}`);
    assert.match(image.heroUrl, /^https:\/\/images\.unsplash\.com\//);
    assert.match(image.thumbnailUrl, /^https:\/\/images\.unsplash\.com\//);
    assert.ok(image.alt.includes(destination.name));
    assert.equal(image.credit, "Unsplash");
  }
});

test("unknown destinations do not return a misleading image", () => {
  assert.equal(getDestinationImage("not-a-real-destination"), undefined);
});

test("known mismatched destination assets use scenic replacements", () => {
  const scenicReplacementSlugs = [
    "chengdu",
    "guangzhou",
    "shenzhen",
    "chongqing",
    "guilin",
    "lijiang",
    "dali",
    "sanya",
    "lhasa",
    "suzhou",
    "xiamen",
    "qingdao",
    "huangshan",
    "kunming",
    "seoul",
    "chiang-mai",
  ];

  for (const slug of scenicReplacementSlugs) {
    const original = popularDestinations.find(
      (destination) => destination.slug === slug
    );
    const curated = getDestinationImage(slug);

    assert.ok(original);
    assert.ok(curated);
    assert.notEqual(curated.heroUrl, original.imageUrl, `${slug} was not replaced`);
    assert.notEqual(
      curated.thumbnailUrl,
      original.thumbnailUrl,
      `${slug} thumbnail was not replaced`
    );
  }
});
