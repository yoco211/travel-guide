"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";

// ============================================================
// Gradient fallbacks (same as before)
// ============================================================
const CITY_GRADIENTS: Record<string, string> = {
  beijing: "from-red-600 via-rose-500 to-orange-400",
  shanghai: "from-indigo-600 via-blue-500 to-cyan-400",
  chengdu: "from-orange-500 via-amber-400 to-yellow-300",
  "hong-kong": "from-purple-600 via-pink-500 to-red-400",
  xian: "from-amber-700 via-orange-500 to-yellow-500",
  hangzhou: "from-emerald-600 via-teal-500 to-cyan-400",
  guangzhou: "from-rose-600 via-red-400 to-orange-300",
  shenzhen: "from-cyan-600 via-teal-500 to-emerald-400",
  chongqing: "from-red-700 via-red-500 to-orange-400",
  guilin: "from-green-600 via-emerald-400 to-teal-300",
  lijiang: "from-sky-500 via-blue-400 to-violet-400",
  dali: "from-teal-500 via-cyan-400 to-sky-300",
  sanya: "from-cyan-500 via-sky-400 to-blue-300",
  lhasa: "from-violet-700 via-purple-500 to-pink-400",
  suzhou: "from-emerald-500 via-green-400 to-lime-300",
  xiamen: "from-sky-600 via-blue-400 to-cyan-300",
  qingdao: "from-blue-600 via-sky-500 to-cyan-300",
  zhangjiajie: "from-emerald-700 via-green-500 to-teal-300",
  huangshan: "from-stone-600 via-amber-500 to-yellow-400",
  kunming: "from-pink-500 via-rose-400 to-orange-300",
  nanjing: "from-slate-700 via-gray-500 to-amber-400",
  tokyo: "from-red-500 via-rose-400 to-pink-300",
  kyoto: "from-orange-600 via-amber-400 to-yellow-400",
  seoul: "from-indigo-500 via-blue-400 to-cyan-300",
  bangkok: "from-amber-500 via-orange-400 to-red-300",
  bali: "from-emerald-600 via-teal-400 to-cyan-300",
  singapore: "from-fuchsia-600 via-purple-500 to-indigo-400",
  "chiang-mai": "from-green-600 via-emerald-400 to-lime-300",
  hanoi: "from-yellow-600 via-amber-400 to-orange-300",
  "kuala-lumpur": "from-blue-600 via-indigo-500 to-purple-400",
  paris: "from-blue-600 via-indigo-500 to-violet-400",
  london: "from-slate-700 via-gray-500 to-blue-400",
  barcelona: "from-orange-600 via-red-500 to-pink-400",
  rome: "from-amber-600 via-orange-500 to-red-400",
  prague: "from-emerald-600 via-teal-500 to-cyan-400",
  amsterdam: "from-orange-500 via-amber-400 to-green-300",
  santorini: "from-sky-500 via-blue-400 to-indigo-300",
  reykjavik: "from-slate-600 via-blue-500 to-cyan-400",
  vienna: "from-amber-500 via-yellow-400 to-rose-300",
  lisbon: "from-orange-500 via-amber-400 to-pink-300",
  dubai: "from-amber-500 via-yellow-400 to-orange-300",
  istanbul: "from-red-600 via-orange-500 to-amber-400",
  "new-york": "from-slate-800 via-blue-600 to-cyan-500",
  "mexico-city": "from-orange-600 via-red-500 to-pink-400",
  "rio-de-janeiro": "from-emerald-600 via-green-500 to-yellow-400",
  sydney: "from-sky-600 via-blue-400 to-amber-300",
  maldives: "from-cyan-500 via-teal-400 to-blue-300",
  marrakech: "from-red-700 via-orange-500-to-amber-400",
  cairo: "from-amber-600 via-yellow-500 to-orange-400",
  "cape-town": "from-blue-700 via-indigo-500 to-purple-400",
};

function getGradient(slug: string): string {
  return CITY_GRADIENTS[slug] || "from-primary-500 via-amber-400 to-orange-300";
}

interface SafeImageProps {
  slug: string;
  alt: string;
  className?: string;
  imageUrl?: string;
}

export function SafeImage({ slug, alt, className, imageUrl }: SafeImageProps) {
  const [imgError, setImgError] = useState(false);
  const src = getImageUrl(imageUrl);

  // If image is unavailable, show a deterministic gradient fallback.
  if (imgError || !src) {
    const gradient = getGradient(slug);
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br overflow-hidden",
          gradient,
          className
        )}
      >
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-4 w-32 h-32 rounded-full bg-white/5" />
        <span className="relative text-3xl font-bold text-white/80 select-none tracking-wide">
          {alt}
        </span>
      </div>
    );
  }

  // Try loading real photo
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
}
