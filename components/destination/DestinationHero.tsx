"use client";

import type { Destination } from "@/types";
import { SafeImage } from "@/components/ui/SafeImage";

interface DestinationHeroProps {
  destination: Destination;
}

export function DestinationHero({ destination }: DestinationHeroProps) {
  const quickFacts = [
    { label: "最佳季节", value: destination.bestSeason, icon: "🌸" },
    { label: "语言", value: destination.language, icon: "🗣️" },
    { label: "货币", value: destination.currency, icon: "💵" },
    { label: "时区", value: destination.timezone, icon: "🕐" },
  ];

  return (
    <div className="relative bg-surface-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <SafeImage
          slug={destination.slug}
          alt={destination.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">
              首页
            </a>
            <span>/</span>
            <span className="text-white">{destination.name}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3">
            {destination.name}
          </h1>
          <p className="text-xl text-white/80 mb-2">{destination.country}</p>
          <p className="text-lg text-white/70 max-w-2xl">
            {destination.description}
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="text-lg mb-1">{fact.icon}</div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-wider">
                  {fact.label}
                </p>
                <p className="text-sm text-white font-medium mt-0.5">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
