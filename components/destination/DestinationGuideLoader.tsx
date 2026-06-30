"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DestinationTabs } from "@/components/destination/DestinationTabs";
import { API_BASE } from "@/lib/api-config";
import type { GuideSection } from "@/types";

interface Props {
  destinationName: string;
  destinationCountry?: string;
  destinationImage?: string;
}

export function DestinationGuideLoader({
  destinationName,
  destinationCountry = "",
  destinationImage = "",
}: Props) {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);

  const fetchGuide = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch(`${API_BASE}/api/deepseek/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: destinationName, language: "zh" }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await res.json();

      if (json.success && json.data?.sections?.length > 0) {
        setSections(
          json.data.sections.sort(
            (a: GuideSection, b: GuideSection) => a.order - b.order
          )
        );
        retryCount.current = 0;
      } else {
        const msg = json.error?.message || "攻略数据加载失败";
        setError(msg);
        // Auto-retry once
        if (retryCount.current === 0) {
          retryCount.current++;
          setTimeout(() => fetchGuide(), 2000);
          setError("首次加载较慢，正在自动重试...");
          return;
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("请求超时，请点击重试");
      } else {
        setError("网络错误，请检查连接后重试");
      }
    } finally {
      setLoading(false);
    }
  }, [destinationName]);

  useEffect(() => {
    fetchGuide();
  }, [fetchGuide]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-primary-50 rounded-2xl border border-primary-200">
            <svg
              className="w-5 h-5 text-primary-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm font-medium text-primary-700">
              AI 正在生成「{destinationName}」攻略，首次约需 10-20 秒...
            </span>
          </div>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-surface-100 rounded animate-pulse"
              style={{ width: `${85 - i * 10}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || sections.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-5xl mb-6">⏳</div>
        <h2 className="text-lg font-bold text-surface-900 mb-2">
          {error || "暂无内容"}
        </h2>
        <p className="text-surface-500 mb-8 text-sm max-w-xs mx-auto">
          AI 攻略生成需要一些时间，请点击下方按钮重试
        </p>
        <button
          onClick={() => {
            retryCount.current = 0;
            fetchGuide();
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-medium active:bg-primary-800 active:scale-[0.98] transition-all touch-manipulation min-h-[48px]"
        >
          <svg
            className="w-5 h-5"
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
          点击生成攻略
        </button>
        <p className="text-xs text-surface-400 mt-4">首次生成约需 10-20 秒</p>
      </div>
    );
  }

  return (
    <DestinationTabs
      sections={sections}
      isLoading={false}
      destinationName={destinationName}
      destinationCountry={destinationCountry}
      destinationImage={destinationImage}
    />
  );
}
