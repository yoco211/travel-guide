import { chat } from "@/lib/deepseek";
import {
  buildDestinationSystemPrompt,
  buildDestinationUserMessage,
} from "@/lib/prompts";
import { getCachedGuide, setCachedGuide, cacheKey } from "@/lib/cache";
import type { GuideSection } from "@/types";

export async function getDestinationGuide(
  destinationName: string,
  language: "zh" | "en" = "zh"
): Promise<GuideSection[]> {
  const key = cacheKey(destinationName, language);

  // Check cache first
  const cached = getCachedGuide(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.sections && parsed.sections.length > 0) {
        return parsed.sections.sort(
          (a: GuideSection, b: GuideSection) => a.order - b.order
        );
      }
    } catch {
      // Cache corrupted, regenerate
    }
  }

  // Generate new content from DeepSeek
  try {
    const systemPrompt = buildDestinationSystemPrompt();
    const userMessage = buildDestinationUserMessage(destinationName);
    const rawContent = await chat(systemPrompt, userMessage, {
      temperature: 0.7,
      max_tokens: 4096,
    });

    // Cache the raw response
    setCachedGuide(key, rawContent);

    // Extract JSON — DeepSeek may wrap in ```json fences
    let parsed: { sections?: GuideSection[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*"sections"[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        const stripped = rawContent
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
        parsed = JSON.parse(stripped);
      }
    }

    if (parsed.sections && parsed.sections.length > 0) {
      return parsed.sections.sort(
        (a: GuideSection, b: GuideSection) => a.order - b.order
      );
    }
  } catch (error) {
    console.error(`Guide generation failed for ${destinationName}:`, error);
  }

  return [];
}
