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
      if (parsed.sections?.length > 0) {
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
    const content = await chat(systemPrompt, userMessage, {
      temperature: 0.7,
      max_tokens: 4096,
    });

    // Cache the result
    setCachedGuide(key, content);

    const parsed = JSON.parse(content);
    if (parsed.sections?.length > 0) {
      return parsed.sections.sort(
        (a: GuideSection, b: GuideSection) => a.order - b.order
      );
    }
  } catch (error) {
    console.error(`Guide generation failed for ${destinationName}:`, error);
  }

  return [];
}
