"use client";

import { StreamingSection } from "@/components/planner/StreamingSection";
import { ShareButton } from "@/components/ui/ShareButton";
import { PrintButton } from "@/components/ui/PrintButton";
import type { GuideSection } from "@/types";

interface GuideResultProps {
  sections: GuideSection[];
  destination: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  onAbort: () => void;
  onRetry: () => void;
}

export function GuideResult({
  sections,
  destination,
  isStreaming,
  isComplete,
  error,
  onAbort,
  onRetry,
}: GuideResultProps) {
  // Filter to only show sections that have content or are being streamed
  const visibleSections = sections.filter(
    (s) => s.content.length > 0 || isStreaming
  );

  if (error) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-6xl mb-6">😞</div>
        <h3 className="text-xl font-semibold text-surface-900 mb-3">
          生成失败
        </h3>
        <p className="text-surface-500 mb-8 max-w-md mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重新尝试
        </button>
      </div>
    );
  }

  if (visibleSections.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      {/* Result Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900">
            {destination} 旅游攻略
          </h2>
          <p className="text-surface-500 text-sm mt-1">
            {isComplete
              ? "✅ 攻略已生成完成"
              : "🤖 AI 正在为你生成个性化攻略..."}
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          {isComplete && (
            <>
              <ShareButton
                title={`${destination} 旅游攻略`}
                description={`AI 生成的 ${destination} 旅游攻略，涵盖景点、交通、美食、住宿`}
                variant="icon"
              />
              <PrintButton variant="icon" />
            </>
          )}
          {isStreaming && (
            <button
              onClick={onAbort}
              className="px-4 py-2 text-sm font-medium text-accent-red hover:bg-red-50 rounded-lg transition-colors"
            >
              取消生成
            </button>
          )}
        </div>
      </div>

      {/* Section List */}
      <div className="space-y-4">
        {sections
          .filter((s) => s.content.length > 0 || isStreaming)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <StreamingSection
              key={section.id}
              section={section}
              isStreaming={isStreaming}
              isComplete={isComplete}
            />
          ))}
      </div>

      {/* Streaming Indicator */}
      {isStreaming && sections.every((s) => s.content.length === 0) && (
        <div className="text-center py-16">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            AI 正在为你规划...
          </h3>
          <p className="text-surface-500 text-sm">
            正在生成 {destination} 的完整旅游攻略，请稍候
          </p>
        </div>
      )}
    </div>
  );
}
