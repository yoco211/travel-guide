"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getTodayISO, getDefaultTripDates } from "@/lib/utils";
import {
  BUDGET_OPTIONS,
  INTEREST_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
} from "@/constants";
import type { PlannerFormState, BudgetLevel, Interest, TravelStyle } from "@/types";

interface PlannerFormProps {
  onSubmit: (data: PlannerFormState) => void;
  isDisabled: boolean;
}

const defaultTripDates = getDefaultTripDates();

const inputClass = cn(
  // text-base (16px) prevents iOS auto-zoom on focus
  "w-full px-4 py-3.5 text-base rounded-xl border bg-white",
  "text-surface-900 placeholder-surface-400",
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
  "transition-all touch-manipulation"
);

export function PlannerForm({ onSubmit, isDisabled }: PlannerFormProps) {
  const [form, setForm] = useState<PlannerFormState>({
    origin: "",
    destination: "",
    dates: { from: defaultTripDates.from, to: defaultTripDates.to },
    budget: "mid-range",
    interests: [],
    travelStyle: "solo",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const toggleInterest = useCallback((interest: Interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 5
          ? [...prev.interests, interest]
          : prev.interests,
    }));
    setErrors((prev) => ({ ...prev, interests: undefined }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<string, string>> = {};

    if (!form.origin.trim()) {
      newErrors.origin = "请输入出发城市";
    }
    if (!form.destination.trim()) {
      newErrors.destination = "请输入目的地";
    }
    if (!form.dates.from) {
      newErrors.dates = "请选择出发日期";
    }
    if (form.interests.length === 0) {
      newErrors.interests = "至少选择一个兴趣偏好";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Origin & Destination — stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            📍 出发地 <span className="text-accent-red">*</span>
          </label>
          <input
            type="text"
            value={form.origin}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, origin: e.target.value }));
              setErrors((prev) => ({ ...prev, origin: undefined }));
            }}
            placeholder="你的出发城市，如：北京"
            className={cn(
              inputClass,
              errors.origin ? "border-accent-red" : "border-surface-200"
            )}
            disabled={isDisabled}
            inputMode="text"
            autoComplete="off"
          />
          {errors.origin && (
            <p className="mt-1 text-sm text-accent-red">{errors.origin}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            🎯 目的地 <span className="text-accent-red">*</span>
          </label>
          <input
            type="text"
            value={form.destination}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, destination: e.target.value }));
              setErrors((prev) => ({ ...prev, destination: undefined }));
            }}
            placeholder="想去哪里？如：东京"
            className={cn(
              inputClass,
              errors.destination ? "border-accent-red" : "border-surface-200"
            )}
            disabled={isDisabled}
            inputMode="text"
            autoComplete="off"
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-accent-red">{errors.destination}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            出发日期
          </label>
          <input
            type="date"
            value={form.dates.from}
            min={getTodayISO()}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                dates: { ...prev.dates, from: e.target.value },
              }))
            }
            className={cn(inputClass, "border-surface-200")}
            disabled={isDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            返程日期
          </label>
          <input
            type="date"
            value={form.dates.to}
            min={form.dates.from || getTodayISO()}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                dates: { ...prev.dates, to: e.target.value },
              }))
            }
            className={cn(inputClass, "border-surface-200")}
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          预算水平
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, budget: opt.value as BudgetLevel }))
              }
              className={cn(
                "min-h-[56px] px-2 py-3 rounded-xl border-2 text-sm font-medium",
                "transition-all touch-manipulation active:scale-[0.96]",
                form.budget === opt.value
                  ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-surface-200 bg-white text-surface-600 active:bg-surface-50"
              )}
              disabled={isDisabled}
            >
              <span className="block text-xl mb-1">{opt.emoji}</span>
              <span className="text-xs">{opt.labelZh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          兴趣偏好 <span className="text-accent-red">*</span>
          <span className="text-surface-400 font-normal ml-1">
            (已选 {form.interests.length}/5)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const selected = form.interests.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleInterest(opt.value)}
                className={cn(
                  "min-h-[44px] px-3.5 py-2.5 rounded-full border text-sm font-medium",
                  "transition-all touch-manipulation active:scale-[0.95]",
                  selected
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                    : "border-surface-200 bg-white text-surface-600 active:bg-surface-50"
                )}
                disabled={isDisabled}
              >
                <span className="mr-1">{opt.icon}</span>
                {opt.labelZh}
              </button>
            );
          })}
        </div>
        {errors.interests && (
          <p className="mt-1 text-sm text-accent-red">{errors.interests}</p>
        )}
      </div>

      {/* Travel Style */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          旅行方式
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TRAVEL_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  travelStyle: opt.value as TravelStyle,
                }))
              }
              className={cn(
                "min-h-[48px] px-4 py-3 rounded-xl border-2 text-sm font-medium",
                "transition-all touch-manipulation active:scale-[0.96]",
                "flex items-center gap-2 justify-center",
                form.travelStyle === opt.value
                  ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-surface-200 bg-white text-surface-600 active:bg-surface-50"
              )}
              disabled={isDisabled}
            >
              <span className="text-lg">{opt.icon}</span>
              <span>{opt.labelZh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          补充说明 <span className="text-surface-400 font-normal">(选填)</span>
        </label>
        <textarea
          value={form.additionalNotes}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))
          }
          placeholder="有什么特殊需求吗？"
          rows={2}
          maxLength={500}
          className={cn(inputClass, "resize-none border-surface-200 text-base")}
          disabled={isDisabled}
        />
        <p className="mt-1 text-xs text-surface-400">
          {form.additionalNotes.length}/500
        </p>
      </div>

      {/* Submit — large touch target */}
      <button
        type="submit"
        disabled={isDisabled}
        className={cn(
          "w-full min-h-[56px] flex items-center justify-center gap-2",
          "px-6 py-4 rounded-2xl font-semibold text-lg",
          "transition-all touch-manipulation",
          isDisabled
            ? "bg-surface-200 text-surface-400 cursor-not-allowed"
            : "bg-primary-600 text-white active:bg-primary-800 active:scale-[0.98] shadow-lg"
        )}
      >
        {isDisabled ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            AI 正在生成攻略...
          </>
        ) : (
          <>
            <span className="text-xl">🤖</span>
            生成 AI 攻略
          </>
        )}
      </button>
    </form>
  );
}
