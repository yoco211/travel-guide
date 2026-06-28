import { getDestinationGuide } from "@/lib/guide-generator";
import { guideRequestSchema } from "@/lib/validators";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `请求太频繁，请稍后重试`,
        },
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "请求格式无效" },
      },
      { status: 400 }
    );
  }

  const result = guideRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: result.error.issues.map((i) => i.message).join("; "),
        },
      },
      { status: 400 }
    );
  }

  const { destination } = result.data;

  const sections = await getDestinationGuide(destination, "zh");

  if (sections.length === 0) {
    return Response.json(
      {
        success: false,
        error: {
          code: "AI_ERROR",
          message: "AI 生成失败，请稍后重试",
        },
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      success: true,
      data: { sections },
    },
    {
      headers: {
        // Let CDN/browser cache for 1 hour (stale-while-revalidate 6h)
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=21600",
      },
    }
  );
}
