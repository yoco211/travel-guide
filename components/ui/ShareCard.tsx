"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface ShareCardProps {
  destinationName: string;
  country: string;
  imageUrl: string;
  className?: string;
}

export function ShareCard({
  destinationName,
  country,
  imageUrl,
  className,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateCard = useCallback(async () => {
    if (!cardRef.current || generating) return;

    setGenerating(true);
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      // Download as PNG
      const link = document.createElement("a");
      link.download = `${destinationName}-旅游攻略.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showToast("分享卡片已下载");
    } catch (err) {
      console.error("Share card generation failed:", err);
      showToast("卡片生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  }, [destinationName, generating]);

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={handleGenerateCard}
        disabled={generating}
        className={cn(
          "min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium transition-all touch-manipulation",
          generating
            ? "bg-surface-100 text-surface-400 cursor-not-allowed"
            : "bg-white text-surface-700 hover:bg-surface-50 active:bg-surface-100 border-surface-200"
        )}
      >
        {generating ? (
          <>
            <svg className="w-4 h-4 inline mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            生成中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            下载分享卡片
          </>
        )}
      </button>

      {/* Hidden card for capture */}
      <div
        ref={cardRef}
        className="fixed left-[-9999px] top-0 w-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        aria-hidden="true"
      >
        {/* Card design */}
        <div className="relative h-[300px] bg-gradient-to-br from-primary-500 to-amber-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={destinationName}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="text-4xl font-bold text-white mb-1">{destinationName}</h2>
            <p className="text-xl text-white/80">{country}</p>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✈️</span>
            <div>
              <p className="text-lg font-bold text-surface-900">TravelGuide</p>
              <p className="text-sm text-surface-500">AI 智能旅游攻略</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              🎯 景点推荐
            </span>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              🍜 美食指南
            </span>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              🚇 交通攻略
            </span>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              🏨 住宿推荐
            </span>
          </div>
          <p className="mt-4 text-sm text-surface-400">
            Powered by DeepSeek AI · Built with Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
