"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  variant?: "icon" | "button";
  className?: string;
}

export function ShareButton({
  title,
  description = "",
  url,
  variant = "icon",
  className,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `${title}${description ? ` — ${description}` : ""}`;

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && !!navigator.share
    );
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("链接已复制到剪贴板");
    } catch {
      showToast("复制失败，请手动复制链接");
    }
    setOpen(false);
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text: description, url: shareUrl });
    } catch {
      // User cancelled or not supported
    }
    setOpen(false);
  }, [title, description, shareUrl]);

  const handleWeiboShare = useCallback(() => {
    window.open(
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  }, [shareUrl, shareText]);

  const handleTwitterShare = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  }, [shareUrl, shareText]);

  const buttonBase =
    variant === "button"
      ? "min-h-[44px] px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium bg-white text-surface-700 hover:bg-surface-50 active:bg-surface-100 transition-all touch-manipulation"
      : "min-h-[44px] min-w-[44px] p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 active:bg-surface-200 transition-all touch-manipulation";

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          if (canNativeShare) {
            handleNativeShare();
          } else {
            setOpen((prev) => !prev);
          }
        }}
        className={buttonBase}
        aria-label="分享"
      >
        {variant === "button" ? (
          <>
            <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享
          </>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && !canNativeShare && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-lg py-1 z-50 animate-fade-in">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full text-left px-4 py-3 text-sm text-surface-700 hover:bg-surface-50 active:bg-surface-100 flex items-center gap-3 transition-colors"
          >
            <span className="text-lg">🔗</span>
            复制链接
          </button>
          <button
            type="button"
            onClick={handleTwitterShare}
            className="w-full text-left px-4 py-3 text-sm text-surface-700 hover:bg-surface-50 active:bg-surface-100 flex items-center gap-3 transition-colors"
          >
            <span className="text-lg">🐦</span>
            Twitter / X
          </button>
          <button
            type="button"
            onClick={handleWeiboShare}
            className="w-full text-left px-4 py-3 text-sm text-surface-700 hover:bg-surface-50 active:bg-surface-100 flex items-center gap-3 transition-colors"
          >
            <span className="text-lg">📱</span>
            微博
          </button>
        </div>
      )}
    </div>
  );
}
