import type { TripPlan } from "../types";
import { validateTripPlan } from "./trip-schema";

export const TRIP_STORAGE_KEY = "travelguide:trips:v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function sortTrips(trips: TripPlan[]): TripPlan[] {
  return [...trips].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listStoredTrips(storage = getBrowserStorage()): TripPlan[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(TRIP_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortTrips(
      parsed.flatMap((candidate) => {
        const result = validateTripPlan(candidate);
        return result.success ? [result.data] : [];
      })
    );
  } catch {
    return [];
  }
}

export function saveStoredTrip(
  trip: TripPlan,
  storage = getBrowserStorage()
): TripPlan[] {
  if (!storage) return [trip];

  const trips = listStoredTrips(storage).filter((item) => item.id !== trip.id);
  const nextTrips = sortTrips([trip, ...trips]);
  storage.setItem(TRIP_STORAGE_KEY, JSON.stringify(nextTrips));
  return nextTrips;
}

export function deleteStoredTrip(
  tripId: string,
  storage = getBrowserStorage()
): TripPlan[] {
  if (!storage) return [];

  const nextTrips = listStoredTrips(storage).filter((trip) => trip.id !== tripId);
  storage.setItem(TRIP_STORAGE_KEY, JSON.stringify(nextTrips));
  return nextTrips;
}
