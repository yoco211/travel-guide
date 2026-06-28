import Link from "next/link";
import { popularDestinations } from "@/data/destinations";
import {
  getSeasonalDestinations,
  getCurrentMonth,
  getMonthName,
  getSeasonEmoji,
  getSeasonGradient,
} from "@/lib/season";
import { DestinationCard } from "@/components/ui/DestinationCard";

export function SeasonalSection() {
  const month = getCurrentMonth();
  const { inSeason } = getSeasonalDestinations(popularDestinations, month);

  // Take top 6 in-season destinations
  const topPicks = inSeason.slice(0, 6);

  if (topPicks.length === 0) return null;

  return (
    <section className="py-16">
      <div className={`bg-gradient-to-br ${getSeasonGradient(month)} rounded-3xl p-8 md:p-12`}>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 text-amber-700 text-sm font-medium mb-4">
            <span>{getSeasonEmoji(month)}</span>
            <span>{getMonthName(month)} 最佳旅行地</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mb-3">
            当季推荐
          </h2>
          <p className="text-surface-500 max-w-lg mx-auto">
            {getMonthName(month)}气候宜人，正是探索这些目的地的最佳时节
          </p>
        </div>

        {/* Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topPicks.map((dest) => (
            <DestinationCard
              key={dest.slug}
              destination={dest}
              variant="featured"
            />
          ))}
        </div>

        {/* Footer link */}
        <div className="text-center mt-8">
          <Link
            href="#explore-all"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            查看全部 {inSeason.length} 个当季目的地
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
