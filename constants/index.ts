import type { BudgetLevel, Interest, TravelStyle } from "@/types";

export const SITE_NAME = "TravelGuide";
export const SITE_DESCRIPTION =
  "探索全球热门目的地，AI 智能生成个性化旅游攻略。涵盖景点、交通、饮食、住宿，让你的旅行更轻松。";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BUDGET_OPTIONS: {
  value: BudgetLevel;
  label: string;
  labelZh: string;
  emoji: string;
}[] = [
  { value: "budget", label: "Budget", labelZh: "经济实惠", emoji: "💰" },
  { value: "mid-range", label: "Mid-Range", labelZh: "舒适中档", emoji: "🏨" },
  { value: "luxury", label: "Luxury", labelZh: "奢华享受", emoji: "👑" },
];

export const INTEREST_OPTIONS: { value: Interest; label: string; labelZh: string; icon: string }[] =
  [
    { value: "food", label: "Food", labelZh: "美食", icon: "🍜" },
    { value: "history", label: "History", labelZh: "历史", icon: "🏛️" },
    { value: "nature", label: "Nature", labelZh: "自然风光", icon: "🏔️" },
    { value: "shopping", label: "Shopping", labelZh: "购物", icon: "🛍️" },
    { value: "nightlife", label: "Nightlife", labelZh: "夜生活", icon: "🌃" },
    { value: "technology", label: "Technology", labelZh: "科技", icon: "🤖" },
    { value: "art", label: "Art", labelZh: "艺术", icon: "🎨" },
    { value: "adventure", label: "Adventure", labelZh: "探险", icon: "🧗" },
    { value: "relaxation", label: "Relaxation", labelZh: "休闲放松", icon: "🌴" },
    { value: "culture", label: "Culture", labelZh: "文化", icon: "🎭" },
  ];

export const TRAVEL_STYLE_OPTIONS: {
  value: TravelStyle;
  label: string;
  labelZh: string;
  icon: string;
}[] = [
  { value: "solo", label: "Solo", labelZh: "独自旅行", icon: "🚶" },
  { value: "couple", label: "Couple", labelZh: "情侣出游", icon: "💑" },
  { value: "family", label: "Family", labelZh: "家庭出行", icon: "👨‍👩‍👧‍👦" },
  { value: "friends", label: "Friends", labelZh: "朋友结伴", icon: "👫" },
];

export const GUIDE_SECTIONS = [
  { id: "overview", title: "目的地概览", order: 1 },
  { id: "attractions", title: "景点推荐", order: 2 },
  { id: "food", title: "美食指南", order: 3 },
  { id: "transport", title: "交通攻略", order: 4 },
  { id: "accommodation", title: "住宿推荐", order: 5 },
  { id: "itinerary", title: "行程建议", order: 6 },
  { id: "tips", title: "实用贴士", order: 7 },
] as const;

export const REGIONS = [
  "China",
  "East Asia",
  "Southeast Asia",
  "Europe",
  "North America",
  "Oceania",
  "Middle East",
  "South Asia",
  "South America",
  "Africa",
] as const;
