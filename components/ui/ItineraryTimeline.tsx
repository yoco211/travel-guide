"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import {
  parseItinerary,
  PERIOD_ICONS,
  PERIOD_BG,
  type DayEntry,
} from "@/lib/parse-itinerary";

interface ItineraryTimelineProps {
  content: string;
  className?: string;
}

function DayCard({ day, index }: { day: DayEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1 }}
      className="relative pl-10 md:pl-12"
    >
      {/* Timeline line */}
      <div className="absolute left-4 md:left-5 top-0 bottom-0 w-px bg-surface-200" />

      {/* Day node */}
      <div className="absolute left-0 md:left-0.5 top-1 w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-md z-10">
        {day.dayNumber}
      </div>

      {/* Day card */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
        {/* Day header */}
        <div className="px-5 py-3 border-b border-surface-100 bg-surface-50/50">
          <h3 className="font-display font-bold text-surface-900 text-lg">
            {day.label}
          </h3>
          {day.timeBlocks.length > 0 && (
            <p className="text-xs text-surface-500 mt-0.5">
              {day.timeBlocks.length} 个时段
            </p>
          )}
        </div>

        {/* Time blocks */}
        <div className="divide-y divide-surface-100">
          {day.timeBlocks.map((block, bi) => (
            <div
              key={bi}
              className={cn(
                "px-5 py-4 border-l-4",
                PERIOD_BG[block.period]
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{PERIOD_ICONS[block.period]}</span>
                <span className="text-sm font-semibold text-surface-700">
                  {block.label}
                </span>
              </div>
              <div className="text-surface-700 text-sm leading-relaxed">
                <MarkdownRenderer content={block.content} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ItineraryTimeline({ content, className }: ItineraryTimelineProps) {
  const days = useMemo(() => {
    if (!content) return null;
    return parseItinerary(content, "zh");
  }, [content]);

  // Fallback: render raw markdown if parsing failed
  if (!days || days.length === 0) {
    return (
      <div className={cn("prose", className)}>
        <MarkdownRenderer content={content} />
      </div>
    );
  }

  return (
    <div className={cn("py-4", className)}>
      {/* Timeline header */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
          <span>📅</span>
          行程总览
        </h3>
        <p className="text-sm text-surface-500 mt-1">
          共 {days.length} 天行程
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {days.map((day, index) => (
          <DayCard key={day.dayNumber} day={day} index={index} />
        ))}

        {/* Timeline end dot */}
        <div className="relative pl-10 md:pl-12">
          <div className="absolute left-0 md:left-0.5 top-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-accent-green text-white flex items-center justify-center shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="pt-2 pb-8">
            <p className="text-sm font-medium text-accent-green">行程结束</p>
            <p className="text-xs text-surface-400 mt-0.5">祝旅途愉快 ✈️</p>
          </div>
        </div>
      </div>
    </div>
  );
}
