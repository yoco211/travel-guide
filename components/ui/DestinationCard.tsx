import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types";
import { INTEREST_OPTIONS } from "@/constants";
import { getRegionLabel } from "@/lib/region";
import { SafeImage } from "@/components/ui/SafeImage";

interface DestinationCardProps {
  destination: Destination;
  variant?: "default" | "featured" | "compact";
  className?: string;
}

export function DestinationCard({
  destination,
  variant = "default",
  className,
}: DestinationCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const displayTags = destination.tags.slice(0, 3).map((tag) => {
    const opt = INTEREST_OPTIONS.find((o) => o.value === tag);
    return opt ? `${opt.icon} ${opt.labelZh}` : tag;
  });

  if (isFeatured) {
    return (
      <Link
        href={`/destinations/${destination.slug}`}
        className={cn("group relative block overflow-hidden rounded-3xl", className)}
      >
        <div className="aspect-[16/9] relative overflow-hidden">
          <SafeImage
            slug={destination.slug}
            alt={destination.name}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-display font-bold mb-1">
              {destination.name}
            </h3>
            <p className="text-white/80 text-sm mb-3">{destination.country}</p>
            <p className="text-white/90 text-sm line-clamp-2">
              {destination.description}
            </p>
            <div className="flex gap-2 mt-3">
              {displayTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative block rounded-2xl bg-white border border-surface-200 overflow-hidden",
        "hover:shadow-lg hover:border-surface-300 transition-all duration-300",
        className
      )}
    >
      <div className={cn("relative overflow-hidden", isCompact ? "aspect-square" : "aspect-[4/3]")}>
        <SafeImage
          slug={destination.slug}
          alt={destination.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-surface-900 truncate">
              {destination.name}
            </h3>
            <p className="text-sm text-surface-500">{destination.country}</p>
          </div>
          {!isCompact && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs">
              {getRegionLabel(destination.region)}
            </span>
          )}
        </div>
        {!isCompact && destination.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {displayTags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
