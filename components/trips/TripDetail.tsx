"use client";

import { useMemo } from "react";
import {
  buildItineraryFromGuide,
  findItineraryConflicts,
  reorderActivities,
} from "@/lib/itinerary-utils";
import {
  applyItineraryTemplate,
  BUILT_IN_ITINERARY_TEMPLATES,
} from "@/lib/itinerary-templates";
import { tripToICS, tripToMarkdown } from "@/lib/trip-export";
import { createStayRecord, createTransportSegment } from "@/lib/trip-logistics";
import { calculateBudgetTotal, toggleChecklistItem } from "@/lib/trip-personal-utils";
import type { BudgetCategory, StayRecord, TripActivity, TripDay, TripPlan, TransportMode } from "@/types";

interface TripDetailProps {
  trip: TripPlan;
  onBack: () => void;
  onChange: (trip: TripPlan) => void;
}

const PERIOD_LABELS: Record<TripActivity["period"], string> = {
  morning: "上午",
  afternoon: "下午",
  evening: "晚上",
  "all-day": "全天",
  other: "其他",
};

const TRANSPORT_LABELS: Record<TransportMode, string> = {
  flight: "飞机",
  train: "火车 / 新干线",
  bus: "巴士",
  car: "自驾 / 打车",
  walk: "步行",
  other: "其他",
};

function updateTimestamp(): string {
  return new Date().toISOString();
}

function downloadText(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function TripDetail({ trip, onBack, onChange }: TripDetailProps) {
  const conflicts = useMemo(() => findItineraryConflicts(trip.itinerary), [trip.itinerary]);
  const destinationStops = trip.destinationStops ?? [{
    id: "stop-main",
    destination: trip.request.destination,
    arrivalDate: trip.request.dates.from,
    departureDate: trip.request.dates.to,
  }];

  const updateTrip = (next: Partial<TripPlan>) => {
    onChange({ ...trip, ...next, updatedAt: updateTimestamp() });
  };

  const updateDay = (dayId: string, updater: (day: TripDay) => TripDay) => {
    updateTrip({ itinerary: trip.itinerary.map((day) => day.id === dayId ? updater(day) : day) });
  };

  const updateActivity = (dayId: string, activityId: string, patch: Partial<TripActivity>) => {
    updateDay(dayId, (day) => ({
      ...day,
      activities: day.activities.map((activity) => activity.id === activityId ? { ...activity, ...patch } : activity),
    }));
  };

  const handleImportItinerary = () => {
    const imported = buildItineraryFromGuide(trip.guide.sections, trip.request.dates.from);
    if (imported.length === 0) return;
    if (trip.itinerary.length > 0 && !window.confirm("重新导入会覆盖当前每日安排，确定继续吗？")) return;
    updateTrip({ itinerary: imported });
  };

  const handleAddActivity = (day: TripDay) => {
    const title = window.prompt("请输入安排名称")?.trim();
    if (!title) return;
    updateDay(day.id, (currentDay) => ({
      ...currentDay,
      activities: [...currentDay.activities, {
        id: `${day.id}-activity-${Date.now().toString(36)}`,
        title,
        period: "other",
      }],
    }));
  };

  const handleAddDestination = () => {
    const destination = window.prompt("请输入要加入的城市或目的地")?.trim();
    if (!destination) return;
    updateTrip({
      destinationStops: [...destinationStops, {
        id: `stop-${Date.now().toString(36)}`,
        destination,
        arrivalDate: trip.request.dates.from,
        departureDate: trip.request.dates.to,
      }],
    });
  };

  const handleAddTransport = () => {
    const from = window.prompt("从哪里出发？")?.trim();
    const to = window.prompt("到哪里？")?.trim();
    if (!from || !to) return;
    const modeInput = window.prompt("交通方式：flight / train / bus / car / walk", "train")?.trim() as TransportMode | undefined;
    const mode = modeInput && modeInput in TRANSPORT_LABELS ? modeInput : "other";
    const segment = createTransportSegment(from, to, mode);
    updateTrip({ transportSegments: [...(trip.transportSegments ?? []), segment] });
  };

  const handleAddStay = () => {
    const name = window.prompt("住宿名称？")?.trim();
    const area = window.prompt("所在区域？")?.trim();
    if (!name || !area) return;
    const stay = createStayRecord(name, area, trip.request.dates.from, trip.request.dates.to);
    updateTrip({ stays: [...(trip.stays ?? []), stay] });
  };

  const handleAddBudgetItem = () => {
    const label = window.prompt("预算项目名称？")?.trim();
    const amount = Number(window.prompt("金额？", "0"));
    if (!label || !Number.isFinite(amount) || amount < 0) return;
    const categoryInput = window.prompt("分类：transport / accommodation / food / tickets / shopping / other", "other")?.trim() as BudgetCategory | undefined;
    const category = categoryInput && ["transport", "accommodation", "food", "tickets", "shopping", "other"].includes(categoryInput) ? categoryInput : "other";
    updateTrip({ budget: { ...trip.budget, items: [...trip.budget.items, { id: `budget-${Date.now().toString(36)}`, category, label, amount }] } });
  };

  const handleAddChecklistItem = () => {
    const label = window.prompt("要打卡的事项？")?.trim();
    if (!label) return;
    updateTrip({ checklist: [...(trip.checklist ?? []), { id: `check-${Date.now().toString(36)}`, label, done: false }] });
  };

  const handleAddNote = () => {
    const content = window.prompt("写下这次旅行的备注？")?.trim();
    if (!content) return;
    updateTrip({ notes: [...(trip.notes ?? []), { id: `note-${Date.now().toString(36)}`, content, createdAt: updateTimestamp() }] });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_800_000) {
      window.alert("照片太大，请选择 1.8MB 以内的图片。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateTrip({ photos: [...(trip.photos ?? []), { id: `photo-${Date.now().toString(36)}`, name: file.name, dataUrl: reader.result, createdAt: updateTimestamp() }] });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = BUILT_IN_ITINERARY_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    if (trip.itinerary.length > 0 && !window.confirm(`使用“${template.name}”会覆盖当前每日安排，确定继续吗？`)) return;
    updateTrip({ itinerary: applyItineraryTemplate(template, trip.request.dates.from) });
  };

  const handleShare = async () => {
    const markdown = tripToMarkdown(trip);
    if (navigator.share) {
      await navigator.share({ title: trip.title, text: markdown });
      return;
    }
    await navigator.clipboard.writeText(markdown);
    window.alert("行程内容已复制，可以粘贴到聊天或备忘录中分享。");
  };

  return (
    <section className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-primary-700 hover:text-primary-800">
        ← 返回我的行程
      </button>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-primary-700 font-medium">{trip.request.origin} → {trip.request.destination}</p>
            <input
              value={trip.title}
              onChange={(event) => updateTrip({ title: event.target.value })}
              aria-label="行程名称"
              className="w-full text-2xl md:text-3xl font-display font-bold text-surface-900 mt-2 bg-transparent border-b border-transparent hover:border-surface-200 focus:border-primary-400 focus:outline-none"
            />
            <p className="text-sm text-surface-500 mt-2">
              {trip.request.dates.from} 至 {trip.request.dates.to} · {trip.request.interests.length} 项兴趣偏好
            </p>
          </div>
          <span className="inline-flex self-start px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm">
            {trip.itinerary.length ? `${trip.itinerary.length} 天行程` : "待整理行程"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-surface-100">
          <button type="button" onClick={() => downloadText(`${trip.title}.md`, tripToMarkdown(trip), "text/markdown")} className="min-h-[38px] px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-700 hover:bg-surface-50">导出 Markdown</button>
          <button type="button" onClick={() => downloadText(`${trip.title}.ics`, tripToICS(trip), "text/calendar")} className="min-h-[38px] px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-700 hover:bg-surface-50">加入日历 ICS</button>
          <button type="button" onClick={() => window.print()} className="min-h-[38px] px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-700 hover:bg-surface-50">打印 / PDF</button>
          <button type="button" onClick={() => void handleShare()} className="min-h-[38px] px-3 py-2 rounded-xl bg-primary-50 text-sm text-primary-700 hover:bg-primary-100">分享行程</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">多城市路线</h3>
            <p className="text-sm text-surface-500 mt-1">先记录城市顺序，后面可以继续补充城市间交通。</p>
          </div>
          <button type="button" onClick={handleAddDestination} className="min-h-[40px] px-3 py-2 rounded-xl border border-primary-200 text-sm text-primary-700 hover:bg-primary-50">
            ＋ 添加城市
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
          {destinationStops.map((stop, index) => (
            <div key={stop.id} className="rounded-xl bg-surface-50 border border-surface-100 p-4">
              <p className="text-xs text-surface-400">第 {index + 1} 站</p>
              <p className="font-medium text-surface-900 mt-1">{stop.destination}</p>
              <p className="text-xs text-surface-500 mt-2">{stop.arrivalDate} 至 {stop.departureDate}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-surface-900">城市间交通</h3>
              <p className="text-sm text-surface-500 mt-1">记录换城市时的交通方式。</p>
            </div>
            <button type="button" onClick={handleAddTransport} className="min-h-[38px] px-3 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm hover:bg-primary-100">＋ 添加</button>
          </div>
          <div className="space-y-3 mt-5">
            {(trip.transportSegments ?? []).length === 0 ? <p className="text-sm text-surface-500">暂未记录交通。</p> : (trip.transportSegments ?? []).map((segment) => (
              <div key={segment.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-50 p-3">
                <div><p className="text-sm font-medium text-surface-900">{segment.from} → {segment.to}</p><p className="text-xs text-surface-500 mt-1">{TRANSPORT_LABELS[segment.mode]}</p></div>
                <button type="button" onClick={() => updateTrip({ transportSegments: (trip.transportSegments ?? []).filter((item) => item.id !== segment.id) })} className="text-xs text-red-600 hover:underline">删除</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-surface-900">住宿</h3>
              <p className="text-sm text-surface-500 mt-1">记录酒店、民宿和入住日期。</p>
            </div>
            <button type="button" onClick={handleAddStay} className="min-h-[38px] px-3 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm hover:bg-primary-100">＋ 添加</button>
          </div>
          <div className="space-y-3 mt-5">
            {(trip.stays ?? []).length === 0 ? <p className="text-sm text-surface-500">暂未记录住宿。</p> : (trip.stays ?? []).map((stay: StayRecord) => (
              <div key={stay.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-50 p-3">
                <div><p className="text-sm font-medium text-surface-900">{stay.name}</p><p className="text-xs text-surface-500 mt-1">{stay.area} · {stay.checkIn} 至 {stay.checkOut}</p></div>
                <button type="button" onClick={() => updateTrip({ stays: (trip.stays ?? []).filter((item) => item.id !== stay.id) })} className="text-xs text-red-600 hover:underline">删除</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-surface-900">每日行程</h3>
            <p className="text-sm text-surface-500 mt-1">可以直接修改安排、时间和地点，调整结果会自动保存。</p>
          </div>
          <button type="button" onClick={handleImportItinerary} className="min-h-[40px] px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-700 hover:bg-surface-50">
            {trip.itinerary.length ? "重新从攻略导入" : "从攻略导入"}
          </button>
          <select key={trip.updatedAt} defaultValue="" onChange={(event) => handleApplyTemplate(event.target.value)} aria-label="选择行程模板" className="min-h-[40px] px-3 py-2 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">套用模板…</option>
            {BUILT_IN_ITINERARY_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
        </div>

        {conflicts.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="font-medium text-amber-900">时间检查</h4>
            <div className="space-y-1 mt-2 text-sm text-amber-800">
              {conflicts.map((conflict, index) => <p key={`${conflict.dayId}-${index}`}>{conflict.severity === "error" ? "⚠️" : "💡"} {conflict.message}</p>)}
            </div>
          </div>
        )}

        {trip.itinerary.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-10 text-center">
            <div className="text-4xl mb-3">📅</div>
            <h4 className="font-medium text-surface-900">还没有结构化的每日安排</h4>
            <p className="text-sm text-surface-500 mt-2">点击“从攻略导入”，把 AI 生成的行程变成可以编辑的卡片。</p>
          </div>
        ) : (
          trip.itinerary.map((day) => (
            <div key={day.id} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <input value={day.label} onChange={(event) => updateDay(day.id, (current) => ({ ...current, label: event.target.value }))} aria-label={`${day.label}名称`} className="font-semibold text-surface-900 bg-transparent border-b border-transparent hover:border-surface-200 focus:border-primary-400 focus:outline-none" />
                  <p className="text-sm text-surface-500 mt-1">{day.date}</p>
                </div>
                <button type="button" onClick={() => handleAddActivity(day)} className="self-start min-h-[38px] px-3 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm hover:bg-primary-100">
                  ＋ 添加安排
                </button>
              </div>

              <div className="space-y-3">
                {day.activities.map((activity, index) => (
                  <article key={activity.id} className="rounded-xl border border-surface-200 p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px] gap-2">
                          <input value={activity.title} onChange={(event) => updateActivity(day.id, activity.id, { title: event.target.value })} aria-label="安排名称" className="min-h-[40px] px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                          <input type="time" value={activity.startTime || ""} onChange={(event) => updateActivity(day.id, activity.id, { startTime: event.target.value || undefined })} aria-label="开始时间" className="min-h-[40px] px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                          <input type="time" value={activity.endTime || ""} onChange={(event) => updateActivity(day.id, activity.id, { endTime: event.target.value || undefined })} aria-label="结束时间" className="min-h-[40px] px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2">
                          <select value={activity.period} onChange={(event) => updateActivity(day.id, activity.id, { period: event.target.value as TripActivity["period"] })} aria-label="时段" className="min-h-[40px] px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            {Object.entries(PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                          <input value={activity.location || ""} onChange={(event) => updateActivity(day.id, activity.id, { location: event.target.value || undefined })} placeholder="地点" aria-label="地点" className="min-h-[40px] px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <textarea value={activity.notes || ""} onChange={(event) => updateActivity(day.id, activity.id, { notes: event.target.value || undefined })} placeholder="备注" aria-label="安排备注" rows={2} className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <button type="button" disabled={index === 0} onClick={() => updateDay(day.id, (current) => reorderActivities(current, index, index - 1))} className="min-h-[36px] px-2.5 rounded-lg border border-surface-200 text-xs text-surface-600 disabled:opacity-40">↑</button>
                        <button type="button" disabled={index === day.activities.length - 1} onClick={() => updateDay(day.id, (current) => reorderActivities(current, index, index + 1))} className="min-h-[36px] px-2.5 rounded-lg border border-surface-200 text-xs text-surface-600 disabled:opacity-40">↓</button>
                        <button type="button" onClick={() => updateDay(day.id, (current) => ({ ...current, activities: current.activities.filter((item) => item.id !== activity.id) }))} className="min-h-[36px] px-2.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50">删</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

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

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="text-lg font-semibold text-surface-900">预算</h3><p className="text-sm text-surface-500 mt-1">币种：{trip.budget.currency}</p></div>
            <button type="button" onClick={handleAddBudgetItem} className="min-h-[38px] px-3 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm hover:bg-primary-100">＋ 添加</button>
          </div>
          <p className="text-2xl font-bold text-surface-900 mt-5">{calculateBudgetTotal(trip.budget.items).toLocaleString()} <span className="text-sm font-normal text-surface-500">{trip.budget.currency}</span></p>
          {trip.budget.items.length === 0 ? <p className="text-sm text-surface-500 mt-3">还没有记录预算。</p> : <div className="space-y-3 mt-4">{trip.budget.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="text-surface-600">{item.label}</span><div className="flex items-center gap-3"><span className="font-medium text-surface-900">{item.amount.toLocaleString()}</span><button type="button" onClick={() => updateTrip({ budget: { ...trip.budget, items: trip.budget.items.filter((budgetItem) => budgetItem.id !== item.id) } })} className="text-xs text-red-600 hover:underline">删除</button></div></div>)}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-surface-900">出行清单</h3><button type="button" onClick={handleAddChecklistItem} className="text-sm text-primary-700 hover:underline">＋ 添加</button></div>
          <div className="space-y-2 mt-4">{(trip.checklist ?? []).length === 0 ? <p className="text-sm text-surface-500">例如：护照、充电器、药品。</p> : (trip.checklist ?? []).map((item) => <div key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.done} onChange={() => updateTrip({ checklist: toggleChecklistItem(trip.checklist ?? [], item.id) })} aria-label={item.label} /><span className={item.done ? "line-through text-surface-400" : "text-surface-700"}>{item.label}</span><button type="button" onClick={() => updateTrip({ checklist: (trip.checklist ?? []).filter((checkItem) => checkItem.id !== item.id) })} className="ml-auto text-xs text-red-600">删</button></div>)}</div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-surface-900">旅行笔记</h3><button type="button" onClick={handleAddNote} className="text-sm text-primary-700 hover:underline">＋ 添加</button></div>
          <div className="space-y-3 mt-4">{(trip.notes ?? []).length === 0 ? <p className="text-sm text-surface-500">记录预约信息、灵感或临时提醒。</p> : (trip.notes ?? []).map((note) => <div key={note.id} className="rounded-xl bg-surface-50 p-3 text-sm text-surface-700"><p className="whitespace-pre-wrap">{note.content}</p><button type="button" onClick={() => updateTrip({ notes: (trip.notes ?? []).filter((item) => item.id !== note.id) })} className="mt-2 text-xs text-red-600">删除</button></div>)}</div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-surface-900">照片</h3><label className="cursor-pointer text-sm text-primary-700 hover:underline">＋ 添加<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label></div>
          <p className="text-xs text-surface-400 mt-1">单张不超过 1.8MB，仅保存在本浏览器。</p>
          <div className="grid grid-cols-3 gap-2 mt-4">{(trip.photos ?? []).map((photo) => <div key={photo.id} className="relative group">
            {/* Local data URLs are intentionally rendered directly for private photo previews. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.dataUrl} alt={photo.name} className="w-full aspect-square object-cover rounded-lg" />
            <button type="button" onClick={() => updateTrip({ photos: (trip.photos ?? []).filter((item) => item.id !== photo.id) })} className="absolute top-1 right-1 hidden group-hover:block rounded-full bg-black/70 text-white text-xs w-6 h-6">×</button>
          </div>)}</div>
          {(trip.photos ?? []).length === 0 && <p className="text-sm text-surface-500 mt-4">还没有照片附件。</p>}
        </div>
      </div>
    </section>
  );
}
