import Link from "next/link";
import type { Metadata } from "next";
import { searchDestinations } from "@/data/destinations";
import { DestinationCard } from "@/components/ui/DestinationCard";

export const metadata: Metadata = {
  title: "搜索目的地",
  description: "搜索你感兴趣的目的地，发现完美的旅行目的地",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query ? searchDestinations(query) : [];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mb-2">
            {query ? `搜索: ${query}` : "搜索目的地"}
          </h1>
          <p className="text-surface-500">
            {query
              ? `找到 ${results.length} 个相关目的地`
              : "输入目的地名称搜索你感兴趣的旅行目的地"}
          </p>

          {/* Search Box */}
          <form className="mt-4 max-w-xl" action="/search" method="GET">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="搜索城市、国家或地区..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {query ? (
          results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((dest) => (
                  <DestinationCard key={dest.slug} destination={dest} />
                ))}
              </div>

              {/* AI Planner CTA */}
              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-3xl p-8 max-w-2xl mx-auto">
                  <p className="text-lg text-surface-700 mb-4">
                    没找到满意的？让 AI 为你定制专属攻略
                  </p>
                  <Link
                    href={`/ai-planner`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    <span>🤖</span>
                    使用 AI 规划器
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h2 className="text-2xl font-display font-bold text-surface-900 mb-3">
                未找到相关目的地
              </h2>
              <p className="text-surface-500 mb-8 max-w-md mx-auto">
                没有找到与 &quot;{query}&quot; 相关的目的地。试试使用其他关键词，
                或通过 AI 规划器来定制你的旅行。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/ai-planner"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <span>🤖</span>
                  AI 规划旅行
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-100 transition-colors"
                >
                  浏览热门目的地
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🌍</div>
            <h2 className="text-xl font-semibold text-surface-700 mb-3">
              输入目的地名称开始搜索
            </h2>
            <p className="text-surface-500">
              或者浏览下方热门目的地
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
