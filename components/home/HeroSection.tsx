import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";

const QUICK_DESTINATIONS = [
  { label: "东京", slug: "tokyo" },
  { label: "巴黎", slug: "paris" },
  { label: "巴厘岛", slug: "bali" },
  { label: "纽约", slug: "new-york" },
  { label: "伦敦", slug: "london" },
  { label: "曼谷", slug: "bangkok" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-orange-50 to-amber-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
            <span>🤖</span>
            <span>Powered by DeepSeek AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-surface-900 leading-tight mb-6 animate-slide-up">
            探索世界，
            <br />
            <span className="text-primary-600">AI 为你导航</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-surface-600 mb-10 max-w-2xl mx-auto animate-slide-up">
            选择目的地，告诉我们你的偏好，AI 为你生成涵盖景点、交通、饮食、住宿的完整旅游攻略
          </p>

          {/* Search Bar */}
          <div className="animate-slide-up flex justify-center">
            <SearchBar
              variant="hero"
              placeholder="搜索目的地，如：东京、巴黎、巴厘岛..."
            />
          </div>

          {/* Quick Destinations */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-fade-in">
            <span className="text-sm text-surface-500">热门：</span>
            {QUICK_DESTINATIONS.map((city) => (
              <Link
                key={city.slug}
                href={`/destinations/${city.slug}`}
                className="px-3 py-1.5 bg-white/70 hover:bg-white rounded-full text-sm text-surface-700 hover:text-primary-600 border border-surface-200 hover:border-primary-300 transition-all shadow-sm"
              >
                {city.label}
              </Link>
            ))}
            <Link
              href="/ai-planner"
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-full text-sm text-white transition-all shadow-sm"
            >
              更多目的地 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
