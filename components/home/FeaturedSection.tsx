import { getFeaturedDestinations } from "@/data/destinations";
import { DestinationCard } from "@/components/ui/DestinationCard";

export function FeaturedSection() {
  const featured = getFeaturedDestinations().slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mb-3">
          精选目的地
        </h2>
        <p className="text-surface-500">经过精心挑选的顶级旅行体验</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map((dest, i) => (
          <div
            key={dest.slug}
            className={i === 1 ? "md:mt-4" : i === 2 ? "md:mt-8" : ""}
          >
            <DestinationCard destination={dest} variant="featured" />
          </div>
        ))}
      </div>
    </section>
  );
}
