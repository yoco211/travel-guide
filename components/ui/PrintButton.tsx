"use client";

import { cn } from "@/lib/utils";

interface PrintButtonProps {
  className?: string;
  label?: string;
  variant?: "icon" | "button";
}

export function PrintButton({
  className,
  label = "导出 PDF",
  variant = "icon",
}: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  const buttonBase =
    variant === "button"
      ? "min-h-[44px] px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium bg-white text-surface-700 hover:bg-surface-50 active:bg-surface-100 transition-all touch-manipulation"
      : "min-h-[44px] min-w-[44px] p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 active:bg-surface-200 transition-all touch-manipulation";

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={cn(buttonBase, className)}
      aria-label={label}
    >
      {variant === "button" ? (
        <>
          <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {label}
        </>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )}
    </button>
  );
}
