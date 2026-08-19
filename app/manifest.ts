import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TravelGuide 旅行规划",
    short_name: "TravelGuide",
    description: "保存和整理你的旅行计划",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#d97706",
    lang: "zh-CN",
    icons: [{ src: "/og-image.svg", sizes: "1200x630", type: "image/svg+xml", purpose: "any" }],
  };
}
