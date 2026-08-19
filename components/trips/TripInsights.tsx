"use client";

import { useEffect, useMemo, useState } from "react";
import { getDestinationInsight, getDateKind, formatDestinationTime } from "@/lib/trip-insights";
import { getTodayISO } from "@/lib/utils";
import type { TripPlan } from "@/types";

interface TripInsightsProps {
  trip: TripPlan;
}

interface WeatherState {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
}

const WEATHER_LABELS: Record<number, string> = {
  0: "晴朗",
  1: "大致晴朗",
  2: "局部多云",
  3: "多云",
  45: "有雾",
  48: "雾凇",
  51: "小毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "阵雨",
  95: "雷雨",
};

function daysUntil(date: string, today: string): number {
  return Math.ceil((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export function TripInsights({ trip }: TripInsightsProps) {
  const insight = useMemo(() => getDestinationInsight(trip.request.destination), [trip.request.destination]);
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const today = now ? getTodayISO() : "";
  const days = today ? daysUntil(trip.request.dates.from, today) : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNow(new Date());
      setReminderEnabled(window.localStorage.getItem(`travelguide:reminder:${trip.id}`) === "1");
    }, 0);
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [trip.id]);

  useEffect(() => {
    if (!insight) return;
    const controller = new AbortController();
    const { lat, lng } = insight.coordinates;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ current?: { temperature_2m: number; weather_code: number; wind_speed_10m: number } }> : Promise.reject(new Error("weather")))
      .then((data) => {
        if (!data.current) throw new Error("weather");
        setWeather({ temperature: data.current.temperature_2m, weatherCode: data.current.weather_code, windSpeed: data.current.wind_speed_10m });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setWeatherError(true);
      });
    return () => controller.abort();
  }, [insight]);

  const enableReminder = async () => {
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    window.localStorage.setItem(`travelguide:reminder:${trip.id}`, "1");
    setReminderEnabled(true);
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <div className="rounded-2xl border border-surface-200 bg-white p-4">
        <p className="text-xs text-surface-400">目的地当地时间</p>
        <p className="text-lg font-semibold text-surface-900 mt-2">{insight && now ? formatDestinationTime(insight.timezone, now) : "正在读取"}</p>
        {insight && <p className="text-xs text-surface-500 mt-1">时区 {insight.timezone}</p>}
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-4">
        <p className="text-xs text-surface-400">目的地天气</p>
        {weather ? <><p className="text-lg font-semibold text-surface-900 mt-2">{Math.round(weather.temperature)}°C · {WEATHER_LABELS[weather.weatherCode] || "天气变化"}</p><p className="text-xs text-surface-500 mt-1">风速 {Math.round(weather.windSpeed)} km/h</p></> : <p className="text-sm text-surface-500 mt-2">{weatherError ? "天气服务暂时不可用" : "正在读取天气"}</p>}
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-4">
        <p className="text-xs text-surface-400">出发提醒</p>
        <p className="text-lg font-semibold text-surface-900 mt-2">{days === null ? "正在计算" : days > 0 ? `${days} 天后出发` : days === 0 ? "今天出发" : "旅程进行中"}</p>
        <p className="text-xs text-surface-500 mt-1">{getDateKind(trip.request.dates.from)} · {trip.request.dates.from}</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-primary-50 p-4">
        <p className="text-xs text-primary-700">浏览器提醒</p>
        <p className="text-sm text-primary-900 mt-2">{reminderEnabled ? "已记录出发提醒设置" : "开启后，在这个浏览器中保留提醒偏好。"}</p>
        {!reminderEnabled && <button type="button" onClick={() => void enableReminder()} className="mt-3 text-xs font-medium text-primary-700 hover:underline">开启提醒</button>}
      </div>
    </section>
  );
}
