// API endpoint configuration
// In production, points to the Cloudflare Worker that handles DeepSeek API calls
export const API_BASE =
  typeof window !== "undefined" && window.location.hostname.includes("pages.dev")
    ? "https://travel-guide-api.travel-guide-cn.workers.dev"
    : ""; // Empty = use relative path (works for local dev and Vercel)
