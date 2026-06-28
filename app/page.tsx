import { popularDestinations } from "@/data/destinations";
import { HeroSection } from "@/components/home/HeroSection";
import { FilterableDestinationGrid } from "@/components/home/FilterableDestinationGrid";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { SeasonalSection } from "@/components/home/SeasonalSection";
import { MapSection } from "@/components/map/MapSection";
import { PlannerCTA } from "@/components/home/PlannerCTA";

export default function HomePage() {
  const destinationsByRegion = [...popularDestinations].sort(
    (a, b) => b.popularity - a.popularity
  );

  return (
    <>
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeasonalSection />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="explore-all">
        <FilterableDestinationGrid destinations={destinationsByRegion} />
      </div>

      <FeaturedSection />

      <MapSection destinations={destinationsByRegion} />

      <PlannerCTA />
    </>
  );
}
