"use client";

import { useRef, useState } from "react";
import { parseTripsImport, serializeTrips } from "@/lib/trip-export";
import type { TripPlan } from "@/types";

interface TripDataToolsProps {
  trips: TripPlan[];
  onChange: (trips: TripPlan[]) => void;
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

export function TripDataTools({ trips, onChange }: TripDataToolsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imported = parseTripsImport(await file.text());
      const byId = new Map(trips.map((trip) => [trip.id, trip]));
      imported.forEach((trip) => byId.set(trip.id, trip));
      onChange([...byId.values()]);
      setMessage(`已导入 ${imported.length} 份行程`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败，请检查文件。");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <button type="button" disabled={trips.length === 0} onClick={() => downloadText("travelguide-trips.json", serializeTrips(trips), "application/json")} className="min-h-[40px] px-3 py-2 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 hover:bg-surface-50 disabled:opacity-40">
        导出备份 JSON
      </button>
      <button type="button" onClick={() => fileInputRef.current?.click()} className="min-h-[40px] px-3 py-2 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 hover:bg-surface-50">
        导入备份 JSON
      </button>
      <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
      {message && <span role="status" className="text-sm text-surface-500">{message}</span>}
    </div>
  );
}
