"use client";

import { useState } from "react";
import { buildLocalAssistantAnswer } from "@/lib/local-assistant";
import type { TripPlan } from "@/types";

interface TripAssistantProps {
  trip: TripPlan;
}

const QUICK_QUESTIONS = ["预算和清单怎么样？", "哪一天安排最满？", "帮我检查时间冲突"];

export function TripAssistant({ trip }: TripAssistantProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const ask = (value = question) => {
    const nextQuestion = value.trim();
    if (!nextQuestion) return;
    setQuestion(nextQuestion);
    setAnswer(buildLocalAssistantAnswer(trip, nextQuestion));
  };

  return (
    <section className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-orange-50 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">🧭</div>
        <div>
          <h3 className="text-lg font-semibold text-primary-900">行程小助手</h3>
          <p className="text-sm text-primary-800/80 mt-1">只读取当前行程，不联网、不上传内容，帮你快速检查整理情况。</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {QUICK_QUESTIONS.map((item) => <button key={item} type="button" onClick={() => ask(item)} className="px-3 py-1.5 rounded-full bg-white/80 text-xs text-primary-800 hover:bg-white">{item}</button>)}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") ask(); }} placeholder="例如：我还缺哪些准备？" aria-label="向行程小助手提问" className="flex-1 min-h-[42px] px-3 py-2 rounded-xl border border-primary-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <button type="button" onClick={() => ask()} className="min-h-[42px] px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">分析行程</button>
      </div>
      {answer && <div className="whitespace-pre-wrap rounded-xl bg-white/80 border border-white p-4 mt-4 text-sm leading-6 text-surface-700">{answer}</div>}
    </section>
  );
}
