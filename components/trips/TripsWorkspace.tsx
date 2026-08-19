"use client";

import { useEffect, useState } from "react";
import { listStoredTrips, replaceStoredTrips } from "@/lib/trip-storage";
import { TripDashboard } from "@/components/trips/TripDashboard";
import { TripDetail } from "@/components/trips/TripDetail";
import { TripList } from "@/components/trips/TripList";
import type { TripPlan } from "@/types";

export function TripsWorkspace() {
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    const syncSelectedTrip = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#trip=")) {
        setSelectedTripId(null);
        return;
      }
      try {
        setSelectedTripId(decodeURIComponent(hash.slice(6)));
      } catch {
        setSelectedTripId(null);
      }
    };

    const timer = window.setTimeout(() => {
      setTrips(listStoredTrips());
      syncSelectedTrip();
      setIsReady(true);
    }, 0);
    window.addEventListener("hashchange", syncSelectedTrip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", syncSelectedTrip);
    };
  }, []);

  const handleChange = (nextTrips: TripPlan[]) => {
    setTrips(nextTrips);
    replaceStoredTrips(nextTrips);
  };

  const handleTripChange = (nextTrip: TripPlan) => {
    handleChange(trips.map((trip) => trip.id === nextTrip.id ? nextTrip : trip));
  };

  if (!isReady) return <div className="h-48 rounded-2xl bg-white border border-surface-200 animate-pulse" />;

  const selectedTrip = selectedTripId ? trips.find((trip) => trip.id === selectedTripId) : undefined;
  if (selectedTrip) {
    return <TripDetail trip={selectedTrip} onChange={handleTripChange} onBack={() => { window.history.replaceState(null, "", "/my-trips"); setSelectedTripId(null); }} />;
  }

  return <><TripDashboard trips={trips} /><TripList trips={trips} onChange={handleChange} /></>;
}
