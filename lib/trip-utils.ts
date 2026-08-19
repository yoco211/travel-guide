import { popularDestinations } from "../data/destinations";
import type { PlannerRequest, TravelGuide, TripPlan } from "../types";

function createTripId(now: Date): string {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `trip-${now.getTime().toString(36)}-${randomPart}`;
}

function inferCurrency(destination: string): string {
  const match = popularDestinations.find(
    (item) => item.name === destination || item.slug === destination
  )?.currency.match(/^[A-Z]{3}/);

  return match?.[0] || "CNY";
}

export function createTripPlan(
  request: PlannerRequest,
  guide: TravelGuide,
  now = new Date()
): TripPlan {
  const timestamp = now.toISOString();

  return {
    schemaVersion: 1,
    id: createTripId(now),
    title: `${request.destination}之旅`,
    createdAt: timestamp,
    updatedAt: timestamp,
    request,
    guide,
    itinerary: [],
    budget: {
      currency: inferCurrency(request.destination),
      items: [],
    },
  };
}

export function touchTrip(trip: TripPlan, now = new Date()): TripPlan {
  return { ...trip, updatedAt: now.toISOString() };
}
