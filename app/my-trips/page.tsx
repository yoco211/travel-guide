import Link from "next/link";
import { TripsWorkspace } from "@/components/trips/TripsWorkspace";

export const metadata = {
  title: "我的行程 | TravelGuide",
  description: "管理保存在当前浏览器中的旅行计划。",
};

export default function MyTripsPage() {
  return (
    <main className="min-h-screen bg-surface-50">
      <div className="bg-gradient-to-br from-primary-50 via-orange-50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-primary-700">Travel workspace</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mt-2">我的行程</h1>
              <p className="text-surface-500 mt-3 max-w-xl">保存、整理和备份你的旅行计划。数据只保存在当前浏览器，不需要登录。</p>
            </div>
            <Link href="/ai-planner" className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700">＋ 创建新行程</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <TripsWorkspace />
      </div>
    </main>
  );
}
