import type { ItineraryTemplate, TripDay } from "../types";

export const BUILT_IN_ITINERARY_TEMPLATES: ItineraryTemplate[] = [
  {
    id: "city-break",
    name: "城市周末游",
    description: "适合第一次到访：地标、老街、美食和夜景。",
    days: [
      {
        id: "city-break-day-1",
        date: "2000-01-01",
        label: "第1天",
        activities: [
          { id: "city-break-a-1", title: "城市地标与老街", period: "morning", notes: "安排一个代表性地标和一段适合步行的老街。" },
          { id: "city-break-a-2", title: "当地特色午餐", period: "afternoon" },
          { id: "city-break-a-3", title: "河畔或观景台夜景", period: "evening" },
        ],
      },
      {
        id: "city-break-day-2",
        date: "2000-01-02",
        label: "第2天",
        activities: [
          { id: "city-break-a-4", title: "博物馆或文化街区", period: "morning" },
          { id: "city-break-a-5", title: "自由购物与返程", period: "afternoon" },
        ],
      },
    ],
  },
  {
    id: "food-weekend",
    name: "美食周末游",
    description: "把早餐、市场、特色餐厅和夜市排成一条轻松路线。",
    days: [
      {
        id: "food-weekend-day-1",
        date: "2000-01-01",
        label: "第1天",
        activities: [
          { id: "food-weekend-a-1", title: "当地早餐店", period: "morning" },
          { id: "food-weekend-a-2", title: "传统市场与小吃", period: "afternoon" },
          { id: "food-weekend-a-3", title: "预约特色晚餐", period: "evening" },
        ],
      },
      {
        id: "food-weekend-day-2",
        date: "2000-01-02",
        label: "第2天",
        activities: [
          { id: "food-weekend-a-4", title: "咖啡馆与甜点", period: "morning" },
          { id: "food-weekend-a-5", title: "伴手礼采购", period: "afternoon" },
        ],
      },
    ],
  },
  {
    id: "family-easy",
    name: "亲子轻松游",
    description: "每天保留休息时间，减少跨区域移动，适合家庭出行。",
    days: [
      {
        id: "family-easy-day-1",
        date: "2000-01-01",
        label: "第1天",
        activities: [
          { id: "family-easy-a-1", title: "亲子友好景点", period: "morning" },
          { id: "family-easy-a-2", title: "午餐与午休", period: "afternoon" },
          { id: "family-easy-a-3", title: "酒店附近散步", period: "evening" },
        ],
      },
      {
        id: "family-easy-day-2",
        date: "2000-01-02",
        label: "第2天",
        activities: [
          { id: "family-easy-a-4", title: "室内活动或公园", period: "morning" },
          { id: "family-easy-a-5", title: "轻松返程", period: "afternoon" },
        ],
      },
    ],
  },
];

function addDays(date: string, offset: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + offset);
  return parsed.toISOString().slice(0, 10);
}

function instanceId(prefix: string): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

export function applyItineraryTemplate(template: ItineraryTemplate, startDate: string): TripDay[] {
  return template.days.map((day, dayIndex) => ({
    ...day,
    id: instanceId(`${template.id}-day-${dayIndex + 1}`),
    date: addDays(startDate, dayIndex),
    activities: day.activities.map((activity) => ({
      ...activity,
      id: instanceId(`${template.id}-activity`),
    })),
  }));
}
