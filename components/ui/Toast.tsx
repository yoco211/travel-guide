"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ToastState {
  message: string;
  visible: boolean;
}

let globalShow: ((msg: string) => void) | null = null;

/** Call from anywhere to show a toast notification */
export function showToast(message: string) {
  globalShow?.(message);
}

export function ToastContainer() {
  const [toast, setToast] = useState<ToastState>({ message: "", visible: false });

  const show = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  useEffect(() => {
    globalShow = show;
    return () => {
      globalShow = null;
    };
  }, [show]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  if (!toast.visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]",
        "px-5 py-3 bg-surface-900 text-white rounded-xl shadow-lg",
        "text-sm font-medium",
        "animate-fade-in pointer-events-none"
      )}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}
