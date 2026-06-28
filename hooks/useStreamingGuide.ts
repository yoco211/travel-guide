"use client";

import { useState, useCallback, useRef } from "react";
import type { StreamEvent, GuideSection, PlannerRequest } from "@/types";

interface UseStreamingGuideReturn {
  sections: GuideSection[];
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  startGeneration: (request: PlannerRequest) => void;
  abort: () => void;
}

export function useStreamingGuide(): UseStreamingGuideReturn {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const startGeneration = useCallback(async (request: PlannerRequest) => {
    // Reset state
    setSections([]);
    setError(null);
    setIsStreaming(true);
    setIsComplete(false);

    // Initialize empty sections
    const sectionOrder = [
      { id: "overview", title: "目的地概览", order: 1 },
      { id: "attractions", title: "景点推荐", order: 2 },
      { id: "food", title: "美食指南", order: 3 },
      { id: "transport_from_origin", title: "出发地→目的地 交通详情", order: 4 },
      { id: "transport", title: "当地交通攻略", order: 5 },
      { id: "accommodation", title: "住宿推荐", order: 6 },
      { id: "itinerary", title: "行程建议", order: 7 },
      { id: "tips", title: "实用贴士", order: 8 },
    ];

    setSections(
      sectionOrder.map((s) => ({
        id: s.id,
        title: s.title,
        content: "",
        order: s.order,
      }))
    );

    // Start streaming
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/deepseek/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429) {
          throw new Error(errorData?.error?.message || "请求太频繁，请稍后重试");
        }
        throw new Error(errorData?.error?.message || "AI 生成失败");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));

              switch (event.type) {
                case "section_updated":
                  setSections((prev) =>
                    prev.map((s) =>
                      s.id === event.sectionId
                        ? {
                            ...s,
                            title: event.sectionTitle || s.title,
                            content: event.content || s.content,
                          }
                        : s
                    )
                  );
                  break;

                case "guide_complete":
                  setIsStreaming(false);
                  setIsComplete(true);
                  break;

                case "error":
                  throw new Error(event.error || "未知错误");
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue; // Skip malformed JSON
              throw e;
            }
          }
        }
      }

      // Try to parse remaining buffer
      if (buffer.startsWith("data: ")) {
        try {
          const event: StreamEvent = JSON.parse(buffer.slice(6));
          if (event.type === "guide_complete") {
            setIsStreaming(false);
            setIsComplete(true);
          }
        } catch {
          // Ignore
        }
      }

      setIsStreaming(false);
      setIsComplete(true);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User aborted — no error needed
        return;
      }
      const message =
        err instanceof Error ? err.message : "生成失败，请稍后重试";
      setError(message);
      setIsStreaming(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  return { sections, isStreaming, isComplete, error, startGeneration, abort };
}
