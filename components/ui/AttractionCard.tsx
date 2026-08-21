import Link from "next/link";
import type { Attraction } from "@/types";
import { SafeImage } from "@/components/ui/SafeImage";

interface AttractionCardProps {
  attraction: Attraction;
}

export function AttractionCard({ attraction }: AttractionCardProps) {
  return (
    <Link
      href={`/attractions/${attraction.slug}`}
      className="group block overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-100">
        <SafeImage
          slug={attraction.slug}
          alt={`${attraction.name}景色`}
          imageUrl={attraction.imageUrl}
          fallbackLabel={attraction.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-amber-700 shadow-sm backdrop-blur-sm">
          景点
        </span>
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="truncate font-semibold text-surface-900 group-hover:text-primary-700">
            {attraction.name}
          </h3>
          <span className="shrink-0 text-xs text-surface-400">
            {attraction.category}
          </span>
        </div>
        <p className="mb-2 text-sm text-primary-700">
          {attraction.cityName} · {attraction.country}
        </p>
        <p className="line-clamp-2 text-sm leading-6 text-surface-600">
          {attraction.shortDescription}
        </p>
      </div>
    </Link>
  );
}
