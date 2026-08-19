"use client";

import type { TripPlan } from "@/types";

interface TripDetailProps {
  trip: TripPlan;
  onBack: () => void;
}

export function TripDetail({ trip, onBack }: TripDetailProps) {
  return (
    <section className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-primary-700 hover:text-primary-800">
        ← 返回我的行程
      </button>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-sm text-primary-700 font-medium">{trip.request.origin} → {trip.request.destination}</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mt-2">{trip.title}</h2>
            <p className="text-sm text-surface-500 mt-2">
              {trip.request.dates.from} 至 {trip.request.dates.to} · {trip.request.interests.length} 项兴趣偏好
            </p>
          </div>
          <span className="inline-flex self-start px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm">
            {trip.itinerary.length ? `${trip.itinerary.length} 天行程` : "待整理行程"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-surface-900">攻略内容</h3>
          <div className="space-y-5 mt-5">
            {trip.guide.sections.map((section) => (
              <article key={section.id} className="border-b border-surface-100 last:border-0 pb-5 last:pb-0">
                <h4 className="font-medium text-surface-900">{section.title}</h4>
                <p className="whitespace-pre-wrap text-sm leading-7 text-surface-600 mt-2">{section.content}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-surface-900">预算</h3>
            <p className="text-sm text-surface-500 mt-2">币种：{trip.budget.currency}</p>
            {trip.budget.items.length === 0 ? (
              <p className="text-sm text-surface-500 mt-5">还没有记录预算，后续可以在这里逐项添加。</p>
            ) : (
              <div className="space-y-3 mt-5">
                {trip.budget.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-surface-600">{item.label}</span>
                    <span className="font-medium text-surface-900">{item.amount.toLocaleString()} {trip.budget.currency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6">
            <h3 className="text-lg font-semibold text-primary-900">下一步</h3>
            <p className="text-sm leading-6 text-primary-800 mt-2">接下来可以把攻略整理成每日安排，再补充预算、住宿和交通信息。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
