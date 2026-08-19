"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "travelguide:theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const enabled = window.localStorage.getItem(THEME_KEY) === "dark";
      setDark(enabled);
      document.documentElement.dataset.theme = enabled ? "dark" : "light";
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  return <button type="button" onClick={toggle} aria-label={dark ? "切换浅色模式" : "切换深色模式"} className="min-h-[40px] min-w-[40px] rounded-lg text-surface-600 hover:bg-surface-100">{dark ? "☀️" : "🌙"}</button>;
}
