"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchSite, type SiteSearchResult } from "@/data/search";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSearchNavigation } from "@/lib/search";

interface SearchBarProps {
  variant?: "hero" | "default";
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  variant = "default",
  placeholder = "搜索城市或景点...",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiteSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length >= 1) {
      const matches = searchSite(value).slice(0, 8);
      setResults(matches);
      setIsOpen(matches.length > 0);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, []);

  const handleSelect = useCallback(
    (result: SiteSearchResult) => {
      setIsOpen(false);
      setQuery("");
      router.push(result.href);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const navigation = getSearchNavigation(query, results, selectedIndex);

        if (navigation?.kind === "destination") {
          const destination = results.find(
            (result) =>
              result.kind === "destination" && result.slug === navigation.slug
          );
          if (destination) handleSelect(destination);
        } else if (navigation?.kind === "attraction") {
          const attraction = results.find(
            (result) =>
              result.kind === "attraction" && result.slug === navigation.slug
          );
          if (attraction) handleSelect(attraction);
        } else if (navigation?.kind === "search") {
          setIsOpen(false);
          router.push(`/search?q=${encodeURIComponent(navigation.query)}`);
        }
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
      [isOpen, results, selectedIndex, query, handleSelect, router]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        {/* Search Icon */}
        <svg
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none",
            isHero ? "w-6 h-6 text-surface-400" : "w-5 h-5 text-surface-400"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          aria-label="搜索城市或景点"
          aria-autocomplete="list"
          aria-controls="site-search-results"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl border border-surface-200 bg-white text-surface-900 placeholder-surface-400 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            isHero
              ? "pl-14 pr-6 py-5 text-lg shadow-lg"
              : "pl-12 pr-4 py-3.5 text-base shadow-sm"
          )}
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          id="site-search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in"
        >
          <div className="py-2">
            {results.map((result, index) => (
              <button
                key={`${result.kind}-${result.slug}`}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-surface-50",
                  index === selectedIndex && "bg-primary-50"
                )}
              >
                <SafeImage
                  slug={result.slug}
                  alt={result.name}
                  imageUrl={result.thumbnailUrl}
                  fallbackLabel={result.name}
                  className="w-10 h-10 rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-medium text-surface-900 truncate">
                    {result.name}
                  </div>
                  <div className="text-sm text-surface-500">
                    {result.kind === "attraction"
                      ? `${result.cityName} · ${result.category}`
                      : result.country}
                  </div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded text-xs",
                    result.kind === "attraction"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-surface-100 text-surface-600"
                  )}>
                    {result.kind === "attraction" ? "景点" : "城市"}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-surface-100 px-4 py-3">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看所有结果 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
