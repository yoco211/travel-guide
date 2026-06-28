"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// City-specific search keywords for landmark photos
// ============================================================
const CITY_KEYWORDS: Record<string, string> = {
  beijing: "beijing-forbidden-city-tiananmen",
  shanghai: "shanghai-bund-skyline-pudong",
  chengdu: "chengdu-panda-sichuan",
  xian: "xian-terracotta-warriors",
  hangzhou: "hangzhou-west-lake",
  guangzhou: "guangzhou-canton-tower",
  shenzhen: "shenzhen-skyline",
  chongqing: "chongqing-night-city",
  guilin: "guilin-li-river-karst",
  lijiang: "lijiang-old-town",
  dali: "dali-erhai-lake",
  sanya: "sanya-beach-tropical",
  lhasa: "lhasa-potala-palace",
  suzhou: "suzhou-garden-canal",
  xiamen: "xiamen-gulangyu-island",
  qingdao: "qingdao-beach-german",
  zhangjiajie: "zhangjiajie-avatar-mountains",
  huangshan: "huangshan-mountains-mist",
  kunming: "kunming-stone-forest",
  nanjing: "nanjing-sun-yat-sen-mausoleum",
  "hong-kong": "hong-kong-victoria-harbour",
  tokyo: "tokyo-shibuya-sensoji",
  kyoto: "kyoto-temple-fushimi-inari",
  seoul: "seoul-gyeongbokgung-palace",
  bangkok: "bangkok-grand-palace-temple",
  bali: "bali-rice-terrace-temple",
  singapore: "singapore-marina-bay-sands",
  "chiang-mai": "chiang-mai-temple-thailand",
  hanoi: "hanoi-old-quarter-hoan-kiem",
  "kuala-lumpur": "kuala-lumpur-petronas-towers",
  paris: "paris-eiffel-tower-seine",
  london: "london-big-ben-tower-bridge",
  barcelona: "barcelona-sagrada-familia-gaudi",
  rome: "rome-colosseum-vatican",
  prague: "prague-charles-bridge-castle",
  amsterdam: "amsterdam-canal-bikes",
  santorini: "santorini-blue-domes-sunset",
  reykjavik: "reykjavik-northern-lights-iceland",
  vienna: "vienna-schonbrunn-palace",
  lisbon: "lisbon-tram-alfama",
  dubai: "dubai-burj-khalifa-skyline",
  istanbul: "istanbul-blue-mosque-hagia-sophia",
  "new-york": "new-york-statue-of-liberty-skyline",
  "mexico-city": "mexico-city-zocalo-pyramid",
  "rio-de-janeiro": "rio-de-janeiro-christ-redeemer-sugarloaf",
  sydney: "sydney-opera-house-harbour-bridge",
  maldives: "maldives-overwater-bungalow",
  marrakech: "marrakech-medina-souk-morocco",
  cairo: "cairo-pyramids-giza-egypt",
  "cape-town": "cape-town-table-mountain",
};

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

function getKeywords(slug: string): string {
  return CITY_KEYWORDS[slug] || slug.replace(/-/g, "-") + "-city-landmark-travel";
}

// Build a photo URL from Unsplash source (dynamically finds relevant photo)
function getPhotoUrl(slug: string, width: number): string {
  const keywords = getKeywords(slug);
  return `https://source.unsplash.com/${width}x${Math.round(width * 0.75)}/?${keywords}`;
}

interface SafeImageProps {
  slug: string;
  alt: string;
  className?: string;
}

export function SafeImage({ slug, alt, className }: SafeImageProps) {
  const [imgError, setImgError] = useState(false);

  // If image failed to load, show gradient fallback
  if (imgError) {
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
    <img
      src={getPhotoUrl(slug, 800)}
      alt={alt}
      className={cn("object-cover", className)}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
}
