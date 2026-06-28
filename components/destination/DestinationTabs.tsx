"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { GuideSection } from "@/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { ItineraryTimeline } from "@/components/ui/ItineraryTimeline";
import { ShareButton } from "@/components/ui/ShareButton";
import { PrintButton } from "@/components/ui/PrintButton";
import { ShareCard } from "@/components/ui/ShareCard";

interface DestinationTabsProps {
  sections: GuideSection[];
  isLoading: boolean;
  destinationName: string;
  destinationCountry?: string;
  destinationImage?: string;
}

const TAB_ICONS: Record<string, string> = {
  overview: "🏙️",
  attractions: "🎯",
  food: "🍜",
  transport: "🚇",
  accommodation: "🏨",
  itinerary: "📋",
  tips: "💡",
};

export function DestinationTabs({
  sections,
  isLoading,
  destinationName,
  destinationCountry = "",
  destinationImage = "",
}: DestinationTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    sections[0]?.id || "overview"
  );

  const activeSection = sections.find((s) => s.id === activeTab);
  const shareTitle = `${destinationName} 旅游攻略`;
  const shareDescription = `探索 ${destinationName}，涵盖景点、交通、美食、住宿的完整旅游攻略`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Print header (visible only when printing) */}
      <div className="print-header" style={{ display: "none" }}>
        <h2>{shareTitle}</h2>
        <p>Powered by DeepSeek AI · TravelGuide</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4 no-print">
        <h2 className="text-lg font-semibold text-surface-900">
          {destinationName} 攻略详情
        </h2>
        <div className="flex items-center gap-1">
          <ShareCard
            destinationName={destinationName}
            country={destinationCountry}
            imageUrl={destinationImage}
          />
          <ShareButton
            title={shareTitle}
            description={shareDescription}
            variant="icon"
          />
          <PrintButton variant="icon" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 pb-1 mb-6 border-b border-surface-200 -mx-4 px-4 no-print">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-t-lg",
              "transition-all touch-manipulation min-h-[44px]",
              "border-b-2 -mb-[1px]",
              activeTab === section.id
                ? "border-primary-600 text-primary-700 bg-primary-50/50"
                : "border-transparent text-surface-500 active:text-surface-700 active:bg-surface-50"
            )}
          >
            <span className="text-base">{TAB_ICONS[section.id] || "📌"}</span>
            <span className="whitespace-nowrap">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-surface-100 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        ) : activeSection ? (
          activeSection.content ? (
            activeSection.id === "itinerary" ? (
              <ItineraryTimeline content={activeSection.content} />
            ) : (
              <article className="prose max-w-none">
                <MarkdownRenderer content={activeSection.content} />
              </article>
            )
          ) : (
            <p className="text-surface-500 text-center py-12">
              该板块内容正在生成中...
            </p>
          )
        ) : (
          <p className="text-surface-500 text-center py-12">
            暂无内容，请稍后再试
          </p>
        )}
      </div>
    </div>
  );
}
