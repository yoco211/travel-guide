"use client";

import Link from "next/link";

export default function DestinationError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🗺️</div>
        <h2 className="text-2xl font-display font-bold text-surface-900 mb-3">
          攻略加载失败
        </h2>
        <p className="text-surface-500 mb-8">
          目的地信息暂时无法加载，可能是网络问题或目的地不存在
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/ai-planner"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors"
          >
            AI 规划旅行
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-surface-400 mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
