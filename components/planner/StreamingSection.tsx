"use client";

import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { ItineraryTimeline } from "@/components/ui/ItineraryTimeline";
import type { GuideSection } from "@/types";

interface StreamingSectionProps {
  section: GuideSection;
  isStreaming: boolean;
  isComplete: boolean;
}

export function StreamingSection({
  section,
  isStreaming,
  isComplete,
}: StreamingSectionProps) {
  const hasContent = section.content.length > 0;
  const isCurrentlyStreaming = isStreaming && hasContent;

  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-200 bg-white overflow-hidden transition-all duration-300",
        hasContent
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-100 bg-surface-50/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSectionIcon(section.id)}</span>
          <h3 className="font-semibold text-surface-900">{section.title}</h3>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isCurrentlyStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-primary-600">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
              生成中...
            </span>
          )}
          {isComplete && hasContent && (
            <span className="flex items-center gap-1 text-xs text-accent-green">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              已完成
            </span>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="px-6 py-5">
        {hasContent ? (
          <div className="animate-fade-in">
            {section.id === "itinerary" ? (
              <ItineraryTimeline content={section.content} />
            ) : (
              <MarkdownRenderer content={section.content} />
            )}
          </div>
        ) : (
          <LoadingPlaceholder />
        )}
      </div>
    </div>
  );
}

function getSectionIcon(id: string): string {
  const icons: Record<string, string> = {
    overview: "🏙️",
    attractions: "🎯",
    food: "🍜",
    transport_from_origin: "✈️",
    transport: "🚇",
    accommodation: "🏨",
    itinerary: "📋",
    tips: "💡",
  };
  return icons[id] || "📌";
}

function LoadingPlaceholder() {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-surface-100 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-surface-100 rounded animate-pulse w-full" />
      <div className="h-4 bg-surface-100 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-surface-100 rounded animate-pulse w-2/3" />
    </div>
  );
}
