import Link from "next/link";

export function PlannerCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-amber-500 p-10 md:p-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              还没想好去哪？
            </h2>
            <p className="text-white/90 text-lg max-w-lg">
              试试我们的 AI 旅游规划器，输入你的偏好，让 DeepSeek AI
              为你量身定制完美行程
            </p>
          </div>
          <Link
            href="/ai-planner"
            className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
          >
            <span className="text-2xl">🤖</span>
            <span>开始 AI 规划</span>
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
