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

export function duplicateTrip(trip: TripPlan, now = new Date()): TripPlan {
  const duplicate = createTripPlan(trip.request, {
    ...trip.guide,
    sections: trip.guide.sections.map((section) => ({ ...section })),
  }, now);

  return {
    ...duplicate,
    title: `${trip.title} 副本`,
    itinerary: trip.itinerary.map((day) => ({
      ...day,
      activities: day.activities.map((activity) => ({ ...activity })),
    })),
    budget: {
      ...trip.budget,
      items: trip.budget.items.map((item) => ({ ...item })),
    },
  };
}

export function filterTrips(trips: TripPlan[], query: string): TripPlan[] {
  const normalizedQuery = query.trim().toLowerCase();
  const sorted = [...trips].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  if (!normalizedQuery) return sorted;

  return sorted.filter((trip) => {
    const searchableText = [
      trip.title,
      trip.request.destination,
      trip.guide.destination,
      trip.request.budget,
      trip.request.travelStyle,
      trip.request.additionalNotes || "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function getNextTrip(
  trips: TripPlan[],
  today: string
): TripPlan | undefined {
  return [...trips]
    .filter((trip) => trip.request.dates.from >= today)
    .sort((a, b) =>
      a.request.dates.from.localeCompare(b.request.dates.from)
    )[0];
}
