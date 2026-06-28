export const REGION_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  China: {
    label: "中国",
    icon: "🇨🇳",
    color: "border-l-red-500",
  },
  "East Asia": {
    label: "东亚",
    icon: "🏯",
    color: "border-l-red-400",
  },
  "Southeast Asia": {
    label: "东南亚",
    icon: "🌴",
    color: "border-l-emerald-400",
  },
  Europe: {
    label: "欧洲",
    icon: "🏰",
    color: "border-l-blue-400",
  },
  "North America": {
    label: "北美",
    icon: "🗽",
    color: "border-l-indigo-400",
  },
  Oceania: {
    label: "大洋洲",
    icon: "🏝️",
    color: "border-l-cyan-400",
  },
  "Middle East": {
    label: "中东",
    icon: "🕌",
    color: "border-l-amber-400",
  },
  "South Asia": {
    label: "南亚",
    icon: "🛕",
    color: "border-l-orange-400",
  },
  "South America": {
    label: "南美",
    icon: "💃",
    color: "border-l-pink-400",
  },
  Africa: {
    label: "非洲",
    icon: "🦁",
    color: "border-l-yellow-400",
  },
};

export function getRegionLabel(region: string): string {
  return REGION_META[region]?.label || region;
}
