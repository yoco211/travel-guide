"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getNextTrip } from "@/lib/trip-utils";
import { getTodayISO } from "@/lib/utils";
import type { TripPlan } from "@/types";

interface TripDashboardProps {
  trips: TripPlan[];
}

function daysUntil(date: string, today: string): number {
  if (!today) return 0;
  const difference = Date.parse(`${date}T00:00:00`) - Date.parse(`${today}T00:00:00`);
  return Math.max(0, Math.ceil(difference / 86_400_000));
}

export function TripDashboard({ trips }: TripDashboardProps) {
  const [today, setToday] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setToday(getTodayISO()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const nextTrip = getNextTrip(trips, today || "9999-12-31");

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-primary-600 to-orange-500 p-6 text-white shadow-sm">
        <p className="text-sm text-white/75">下一次旅行</p>
        {nextTrip ? (
          <>
            <h2 className="text-2xl font-display font-bold mt-2">{nextTrip.title}</h2>
            <p className="text-white/80 mt-1">
              {nextTrip.request.origin} → {nextTrip.request.destination} · {nextTrip.request.dates.from}
            </p>
            <p className="text-4xl font-bold mt-6">{today ? `${daysUntil(nextTrip.request.dates.from, today)} 天后` : "正在计算"}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-display font-bold mt-2">还没有即将出发的行程</h2>
            <Link href="/ai-planner" className="inline-flex mt-5 px-4 py-2 rounded-xl bg-white text-primary-700 text-sm font-medium">
              创建第一份行程
            </Link>
          </>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-surface-200 p-6 shadow-sm">
        <p className="text-sm text-surface-500">本地行程</p>
        <p className="text-4xl font-bold text-surface-900 mt-3">{trips.length}</p>
        <p className="text-sm text-surface-400 mt-2">保存在当前浏览器</p>
        <p className="text-sm text-surface-600 mt-6">生成后会自动保存，也可以随时导出备份。</p>
      </div>
    </section>
  );
}
