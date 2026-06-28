"use client";

import { useState, useCallback, useRef } from "react";
import { PlannerForm } from "@/components/planner/PlannerForm";
import { GuideResult } from "@/components/planner/GuideResult";
import { useStreamingGuide } from "@/hooks/useStreamingGuide";
import type { PlannerFormState } from "@/types";

export default function AIPlannerPage() {
  const { sections, isStreaming, isComplete, error, startGeneration, abort } =
    useStreamingGuide();

  const [destination, setDestination] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const lastRequestRef = useRef<PlannerFormState | null>(null);

  const handleSubmit = useCallback(
    (data: PlannerFormState) => {
      setDestination(data.destination);
      setHasSubmitted(true);
      lastRequestRef.current = data;
      startGeneration({
        origin: data.origin,
        destination: data.destination,
        dates: data.dates,
        budget: data.budget,
        interests: data.interests,
        travelStyle: data.travelStyle,
        language: "zh",
        additionalNotes: data.additionalNotes,
      });
    },
    [startGeneration]
  );

  const handleRetry = useCallback(() => {
    if (lastRequestRef.current) {
      handleSubmit(lastRequestRef.current);
    }
  }, [handleSubmit]);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-50 via-orange-50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 text-primary-700 text-sm font-medium mb-6">
              <span>🤖</span>
              <span>Powered by DeepSeek AI</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-surface-900 mb-4">
              AI 旅游规划
            </h1>
            <p className="text-lg text-surface-500 max-w-xl mx-auto">
              输入目的地和偏好，DeepSeek AI
              为你生成涵盖景点、交通、饮食、住宿的个性化旅游攻略
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div
          className={
            hasSubmitted
              ? "grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start"
              : "max-w-2xl mx-auto"
          }
        >
          {/* Form Sidebar (sticky on desktop when results shown) */}
          <div
            className={
              hasSubmitted
                ? "lg:sticky lg:top-24 order-1 lg:order-1"
                : "order-1"
            }
          >
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">
                {hasSubmitted ? "调整参数" : "规划你的旅行"}
              </h2>
              <PlannerForm onSubmit={handleSubmit} isDisabled={isStreaming} />
            </div>
          </div>

          {/* Results */}
          {hasSubmitted && (
            <div className="order-2 lg:order-2">
              <GuideResult
                sections={sections}
                destination={destination}
                isStreaming={isStreaming}
                isComplete={isComplete}
                error={error}
                onAbort={abort}
                onRetry={handleRetry}
              />
            </div>
          )}
        </div>

        {/* Empty state when no submission yet */}
        {!hasSubmitted && (
          <div className="mt-16 pb-16">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-surface-700 mb-6">
                AI 将为你生成以下内容：
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "🏙️", label: "目的地概览" },
                  { icon: "🎯", label: "景点推荐" },
                  { icon: "🍜", label: "美食指南" },
                  { icon: "🚇", label: "交通攻略" },
                  { icon: "🏨", label: "住宿推荐" },
                  { icon: "📋", label: "行程建议" },
                  { icon: "💡", label: "实用贴士" },
                  { icon: "✨", label: "更多惊喜" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl border border-surface-200 p-4 text-center hover:border-primary-200 hover:shadow-sm transition-all"
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm font-medium text-surface-700">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
