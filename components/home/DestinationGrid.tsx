"use client";

import { useState } from "react";
import { DestinationCard } from "@/components/ui/DestinationCard";
import type { Destination } from "@/types";
import { REGION_META } from "@/lib/region";
import { cn } from "@/lib/utils";

interface DestinationGridProps {
  destinations: Destination[];
  title?: string;
  subtitle?: string;
}

export function DestinationGrid({
  destinations,
  title = "热门目的地",
  subtitle = "探索全球最受欢迎的旅行目的地",
}: DestinationGridProps) {
  // Group by region
  const grouped = destinations.reduce<Record<string, Destination[]>>(
    (acc, dest) => {
      if (!acc[dest.region]) acc[dest.region] = [];
      acc[dest.region].push(dest);
      return acc;
    },
    {}
  );

  const regionOrder = Object.keys(REGION_META).filter((r) => grouped[r]);

  // Accordion: which regions are expanded (default: China only)
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["China"])
  );

  const toggleRegion = (region: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  // Expand all / collapse all
  const expandAll = () => setExpanded(new Set(regionOrder));
  const collapseAll = () => setExpanded(new Set());

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-3">
          {title}
        </h2>
        <p className="text-lg text-surface-500 max-w-2xl mx-auto mb-4">
          {subtitle}
        </p>
        {/* Quick toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-full hover:bg-primary-50 transition-colors"
          >
            展开全部
          </button>
          <span className="text-surface-300">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-surface-400 hover:text-surface-600 font-medium px-3 py-1 rounded-full hover:bg-surface-100 transition-colors"
          >
            全部收起
          </button>
        </div>
      </div>

      {/* Accordion Regions */}
      <div className="space-y-3">
        {regionOrder.map((region) => {
          const meta = REGION_META[region] || {
            label: region,
            icon: "📍",
            color: "border-l-surface-300",
          };
          const isOpen = expanded.has(region);
          const count = grouped[region].length;

          return (
            <div
              key={region}
              className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm"
            >
              {/* Region Header — clickable */}
              <button
                onClick={() => toggleRegion(region)}
                className={cn(
                  "w-full min-h-[56px] flex items-center gap-3 px-4 py-4 text-left",
                  "transition-colors touch-manipulation",
                  "active:bg-surface-100",
                  isOpen && "bg-surface-50/50"
                )}
              >
                {/* Color bar */}
                <div
                  className={cn(
                    "w-1 self-stretch rounded-full",
                    meta.color.replace("border-l-", "bg-")
                  )}
                />

                <span className="text-2xl">{meta.icon}</span>
                <h3 className="text-lg font-display font-bold text-surface-800 flex-1">
                  {meta.label}
                </h3>
                <span
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    isOpen
                      ? "bg-primary-100 text-primary-700"
                      : "bg-surface-100 text-surface-500"
                  )}
                >
                  {count} 个城市
                </span>

                {/* Expand/collapse chevron */}
                <svg
                  className={cn(
                    "w-5 h-5 text-surface-400 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Collapsible Cards Grid */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-5 pb-5">
                    {grouped[region].map((dest) => (
                      <DestinationCard key={dest.slug} destination={dest} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
