import type { MetadataRoute } from "next";
import { popularDestinations } from "@/data/destinations";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/ai-planner`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...popularDestinations.map((destination) => ({
      url: `${SITE_URL}/destinations/${destination.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
