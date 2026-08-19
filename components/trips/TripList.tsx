"use client";

import { useMemo, useState } from "react";
import { duplicateTrip, filterTrips } from "@/lib/trip-utils";
import { TripCard } from "@/components/trips/TripCard";
import type { TripPlan } from "@/types";

interface TripListProps {
  trips: TripPlan[];
  onChange: (trips: TripPlan[]) => void;
}

export function TripList({ trips, onChange }: TripListProps) {
  const [query, setQuery] = useState("");
  const filteredTrips = useMemo(() => filterTrips(trips, query), [trips, query]);

  const handleRename = (trip: TripPlan) => {
    const nextTitle = window.prompt("请输入新的行程名称", trip.title)?.trim();
    if (!nextTitle || nextTitle === trip.title) return;
    onChange(trips.map((item) => item.id === trip.id ? { ...item, title: nextTitle, updatedAt: new Date().toISOString() } : item));
  };

  const handleDuplicate = (trip: TripPlan) => {
    onChange([duplicateTrip(trip), ...trips]);
  };

  const handleDelete = (trip: TripPlan) => {
    if (!window.confirm(`确定删除“${trip.title}”吗？此操作无法撤销。`)) return;
    onChange(trips.filter((item) => item.id !== trip.id));
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">我的行程</h2>
          <p className="text-sm text-surface-500 mt-1">所有内容只保存在当前浏览器。</p>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索目的地或行程名称" aria-label="搜索我的行程" className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {filteredTrips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-10 text-center">
          <div className="text-5xl mb-4">🧳</div>
          <h3 className="text-lg font-semibold text-surface-900">{trips.length === 0 ? "还没有保存的行程" : "没有匹配的行程"}</h3>
          <p className="text-sm text-surface-500 mt-2">{trips.length === 0 ? "去 AI 规划页面生成一份行程，它会自动出现在这里。" : "换一个目的地或行程名称试试。"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} onRename={handleRename} onDuplicate={handleDuplicate} onDelete={handleDelete} />)}
        </div>
      )}
    </section>
  );
}
