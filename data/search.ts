import { attractions } from "./attractions";
import { popularDestinations } from "./destinations";
import { getDestinationImage } from "./destination-images";
import type { Attraction } from "@/types";

export interface DestinationSearchResult {
  kind: "destination";
  slug: string;
  name: string;
  country: string;
  region: string;
  thumbnailUrl: string;
  matchScore: number;
  href: string;
}

export interface AttractionSearchResult {
  kind: "attraction";
  slug: string;
  name: string;
  country: string;
  cityName: string;
  citySlug: string;
  category: Attraction["category"];
  thumbnailUrl: string;
  matchScore: number;
  href: string;
}

export type SiteSearchResult =
  | DestinationSearchResult
  | AttractionSearchResult;

function scoreMatch(name: string, searchableText: string[], query: string) {
  const normalizedName = name.toLowerCase();
  if (normalizedName === query) return 1;
  if (normalizedName.includes(query)) return 0.85;
  if (searchableText.some((text) => text.toLowerCase().includes(query))) {
    return 0.55;
  }
  return 0;
}

function toDestinationResult(
  destination: (typeof popularDestinations)[number],
  query: string
): DestinationSearchResult | null {
  const score = scoreMatch(
    destination.name,
    [
      destination.country,
      destination.region,
      destination.description,
      ...destination.tags,
    ],
    query
  );
  if (score === 0) return null;

  return {
    kind: "destination",
    slug: destination.slug,
    name: destination.name,
    country: destination.country,
    region: destination.region,
    thumbnailUrl:
      getDestinationImage(destination.slug)?.thumbnailUrl ??
      destination.thumbnailUrl,
    matchScore: score,
    href: `/destinations/${destination.slug}`,
  };
}

function toAttractionResult(
  attraction: Attraction,
  query: string
): AttractionSearchResult | null {
  const score = scoreMatch(
    attraction.name,
    [
      attraction.cityName,
      attraction.country,
      attraction.category,
      attraction.shortDescription,
      attraction.description,
      ...attraction.tags,
    ],
    query
  );
  if (score === 0) return null;

  return {
    kind: "attraction",
    slug: attraction.slug,
    name: attraction.name,
    country: attraction.country,
    cityName: attraction.cityName,
    citySlug: attraction.citySlug,
    category: attraction.category,
    thumbnailUrl: attraction.thumbnailUrl,
    matchScore: score,
    href: `/attractions/${attraction.slug}`,
  };
}

export function searchSite(query: string): SiteSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return [
    ...popularDestinations
      .map((destination) => toDestinationResult(destination, normalizedQuery))
      .filter((result): result is DestinationSearchResult => result !== null),
    ...attractions
      .map((attraction) => toAttractionResult(attraction, normalizedQuery))
      .filter((result): result is AttractionSearchResult => result !== null),
  ].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.kind !== b.kind) return a.kind === "destination" ? -1 : 1;
    return a.name.localeCompare(b.name, "zh-CN");
  });
}

export function searchAttractions(query: string): AttractionSearchResult[] {
  return searchSite(query).filter(
    (result): result is AttractionSearchResult => result.kind === "attraction"
  );
}
