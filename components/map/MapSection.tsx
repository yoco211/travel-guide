import { MapView } from "@/components/map/MapView";
import type { Destination } from "@/types";

interface MapSectionProps {
  destinations: Destination[];
  title?: string;
  subtitle?: string;
}

export function MapSection({
  destinations,
  title = "探索地图",
  subtitle = "在世界地图上发现你的下一个旅行目的地",
}: MapSectionProps) {
  // Map only destinations that have valid coordinates
  const mapDestinations = destinations.filter(
    (d) => d.coordinates?.lat != null && d.coordinates?.lng != null
  );

  if (mapDestinations.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mb-3">
            🗺️ {title}
          </h2>
          <p className="text-surface-500 max-w-lg mx-auto">{subtitle}</p>
        </div>

        {/* Map */}
        <MapView
          destinations={mapDestinations}
          height="min(500px, 60vh)"
        />
      </div>
    </section>
  );
}
