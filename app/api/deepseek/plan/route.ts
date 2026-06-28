import { chat } from "@/lib/deepseek";
import {
  buildPlannerSystemPrompt,
  buildPlannerUserMessage,
} from "@/lib/prompts";
import { plannerRequestSchema } from "@/lib/validators";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import type { PlannerRequest, GuideSection } from "@/types";

// Use Edge Runtime for longer timeout (30s vs 10s on Vercel Hobby)
export const runtime = "edge";

const SECTION_ORDER = [
  "overview",
  "attractions",
  "food",
  "transport_from_origin",
  "transport",
  "accommodation",
  "itinerary",
  "tips",
];

export async function POST(request: Request) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `请求太频繁，请 ${Math.ceil(rateLimit.resetIn / 1000)} 秒后重试`,
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetIn),
        },
      }
    );
  }

  // Validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: { code: "INVALID_JSON", message: "请求格式无效" } },
      { status: 400 }
    );
  }

  const result = plannerRequestSchema.safeParse(body);
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

  const plannerRequest: PlannerRequest = result.data;

  // Build prompts
  const systemPrompt = buildPlannerSystemPrompt(plannerRequest.language);
  const userMessage = buildPlannerUserMessage(plannerRequest);

  // Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Generate the full response from DeepSeek (non-streaming)
        const rawContent = await chat(systemPrompt, userMessage, {
          temperature: 0.7,
          max_tokens: 4096,
        });

        // Step 2: Parse the full JSON response
        let sections: GuideSection[] = [];
        try {
          // Try to find JSON in the response (in case DeepSeek adds markdown wrapping)
          const jsonMatch =
            rawContent.match(/\{[\s\S]*"sections"[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : rawContent;
          const parsed = JSON.parse(jsonStr);

          if (parsed.sections && Array.isArray(parsed.sections)) {
            sections = parsed.sections
              .filter((s: GuideSection) => s.id && s.content)
              .sort(
                (a: GuideSection, b: GuideSection) =>
                  SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id)
              );
          }
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr);
          // If JSON parsing fails, send the raw content as a single overview section
          sections = [
            {
              id: "overview",
              title: "目的地概览",
              content: rawContent,
              order: 1,
            },
          ];
        }

        if (sections.length === 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "AI 返回的内容无法解析，请重试",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Step 3: Stream sections one by one with a short delay
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];

          // Send section_updated event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "section_updated",
                sectionId: section.id,
                sectionTitle: section.title,
                content: section.content,
              })}\n\n`
            )
          );

          // Small delay between sections for progressive-rendering effect
          if (i < sections.length - 1) {
            await sleep(200);
          }
        }

        // Send completion event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "guide_complete" })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        console.error("Plan stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: "AI 生成失败，请稍后重试",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
