import { chat } from "@/lib/deepseek";
import {
  buildDestinationSystemPrompt,
  buildDestinationUserMessage,
} from "@/lib/prompts";
import { guideRequestSchema } from "@/lib/validators";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const runtime = "edge"; // 30s vs 10s on Vercel Hobby

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
      { success: false, error: { code: "INVALID_JSON", message: "请求格式无效" } },
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

  try {
    const systemPrompt = buildDestinationSystemPrompt();
    const userMessage = buildDestinationUserMessage(destination);
    const rawContent = await chat(systemPrompt, userMessage, {
      temperature: 0.7,
      max_tokens: 4096,
    });

    // Extract JSON — DeepSeek may wrap it in ```json fences
    let parsed: { sections?: unknown };
    try {
      // First, try direct parse
      parsed = JSON.parse(rawContent);
    } catch {
      // Try regex extraction (strip markdown code fences)
      const jsonMatch = rawContent.match(/\{[\s\S]*"sections"[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Last resort: try stripping ```json blocks
        const stripped = rawContent
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
        parsed = JSON.parse(stripped);
      }
    }

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      return Response.json(
        {
          success: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "AI 返回格式异常，请重试",
          },
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Guide generation error:", error);
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
}
