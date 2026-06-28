import { z } from "zod/v4";

export const plannerRequestSchema = z.object({
  origin: z.string().min(1, "出发地不能为空").max(100),
  destination: z.string().min(1, "目的地不能为空").max(100),
  dates: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式无效"),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式无效"),
  }),
  budget: z.enum(["budget", "mid-range", "luxury"]),
  interests: z
    .array(
      z.enum([
        "food",
        "history",
        "nature",
        "shopping",
        "nightlife",
        "technology",
        "art",
        "adventure",
        "relaxation",
        "culture",
      ])
    )
    .min(1, "至少选择一个兴趣")
    .max(5),
  travelStyle: z.enum(["solo", "couple", "family", "friends"]),
  language: z.enum(["zh", "en"]).default("zh"),
  additionalNotes: z.string().max(500).optional(),
});

export const guideRequestSchema = z.object({
  destination: z.string().min(1).max(100),
  language: z.enum(["zh", "en"]).default("zh"),
});

export const searchRequestSchema = z.object({
  query: z.string().min(1).max(200),
});

export const revalidateSchema = z.object({
  secret: z.string(),
  slug: z.string().optional(),
});
