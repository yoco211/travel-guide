import Link from "next/link";
import type { TripPlan } from "@/types";

interface TripCardProps {
  trip: TripPlan;
  onRename: (trip: TripPlan) => void;
  onDuplicate: (trip: TripPlan) => void;
  onDelete: (trip: TripPlan) => void;
}

function formatDateRange(trip: TripPlan): string {
  const { from, to } = trip.request.dates;
  return from && to ? `${from} 至 ${to}` : "日期未设置";
}

export function TripCard({ trip, onRename, onDuplicate, onDelete }: TripCardProps) {
  return (
    <article className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-surface-900 truncate">{trip.title}</h3>
          <p className="text-sm text-surface-500 mt-1">
            {trip.request.origin} → {trip.request.destination}
          </p>
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
          {trip.request.budget === "budget" ? "经济" : trip.request.budget === "luxury" ? "舒适" : "中等"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
        <div className="rounded-xl bg-surface-50 p-3">
          <p className="text-xs text-surface-400">出行日期</p>
          <p className="text-surface-700 mt-1">{formatDateRange(trip)}</p>
        </div>
        <div className="rounded-xl bg-surface-50 p-3">
          <p className="text-xs text-surface-400">兴趣偏好</p>
          <p className="text-surface-700 mt-1">{trip.request.interests.length} 项</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-5">
        <Link href={`/my-trips#trip=${encodeURIComponent(trip.id)}`} className="min-h-[40px] inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
          打开行程
        </Link>
        <button type="button" onClick={() => onRename(trip)} className="min-h-[40px] px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-700 hover:bg-surface-50">
          重命名
        </button>
        <button type="button" onClick={() => onDuplicate(trip)} className="min-h-[40px] px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-700 hover:bg-surface-50">
          复制
        </button>
        <button type="button" onClick={() => onDelete(trip)} className="min-h-[40px] px-3 py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50">
          删除
        </button>
      </div>
    </article>
  );
}
