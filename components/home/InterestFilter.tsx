"use client";

import { cn } from "@/lib/utils";
import { INTEREST_OPTIONS } from "@/constants";
import type { Interest } from "@/types";

interface InterestFilterProps {
  selectedInterests: Interest[];
  onToggle: (interest: Interest) => void;
  onClear: () => void;
  className?: string;
}

export function InterestFilter({
  selectedInterests,
  onToggle,
  onClear,
  className,
}: InterestFilterProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-700">
          按兴趣筛选
        </h3>
        {selectedInterests.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            清除全部
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {INTEREST_OPTIONS.map((opt) => {
          const selected = selectedInterests.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "min-h-[44px] px-3.5 py-2.5 rounded-full border text-sm font-medium",
                "transition-all touch-manipulation active:scale-[0.95]",
                "whitespace-nowrap",
                selected
                  ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50"
              )}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.labelZh}
            </button>
          );
        })}
      </div>
    </div>
  );
}
