"use client";

import { useState, useMemo } from "react";
import type { Destination, Interest } from "@/types";
import { InterestFilter } from "@/components/home/InterestFilter";
import { DestinationGrid } from "@/components/home/DestinationGrid";

interface FilterableDestinationGridProps {
  destinations: Destination[];
}

export function FilterableDestinationGrid({
  destinations,
}: FilterableDestinationGridProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  const toggleInterest = (interest: Interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const clearInterests = () => setSelectedInterests([]);

  const filteredDestinations = useMemo(() => {
    if (selectedInterests.length === 0) return destinations;
    // OR logic: match if destination has ANY of the selected interests
    return destinations.filter((d) =>
      d.tags.some((tag) => selectedInterests.includes(tag))
    );
  }, [destinations, selectedInterests]);

  return (
    <div className="space-y-6">
      <InterestFilter
        selectedInterests={selectedInterests}
        onToggle={toggleInterest}
        onClear={clearInterests}
      />

      {/* Status bar */}
      <div className="flex items-center gap-2 text-sm text-surface-500">
        {selectedInterests.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
            筛选: {selectedInterests.length} 个兴趣
          </span>
        )}
        <span>{filteredDestinations.length} 个目的地</span>
      </div>

      {filteredDestinations.length > 0 ? (
        <DestinationGrid
          destinations={filteredDestinations}
          title="按地区探索"
          subtitle="覆盖全球 9 大区域 30 个热门目的地，点击开始你的旅程"
        />
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-surface-700 mb-2">
            没有匹配的目的地
          </h3>
          <p className="text-surface-500 mb-6">
            试试调整筛选条件，或清除筛选查看全部目的地
          </p>
          <button
            type="button"
            onClick={clearInterests}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
