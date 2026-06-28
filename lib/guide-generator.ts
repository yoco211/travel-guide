import { chat } from "@/lib/deepseek";
import {
  buildDestinationSystemPrompt,
  buildDestinationUserMessage,
} from "@/lib/prompts";
import { getCachedGuide, setCachedGuide, cacheKey } from "@/lib/cache";
import type { GuideSection } from "@/types";

/**
 * Extract JSON from a potentially markdown-fenced AI response.
 * Returns the parsed object, or null if extraction fails.
 */
function extractJson(raw: string): { sections?: GuideSection[] } | null {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch {
    // continue
  }

  // Try regex: find {...} containing "sections"
  try {
    const m = raw.match(/\{[\s\S]*"sections"[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  } catch {
    // continue
  }

  // Try stripping ```json / ``` fences
  try {
    const stripped = raw
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/, "")
      .trim();
    return JSON.parse(stripped);
  } catch {
    // continue
  }

  return null;
}

export async function getDestinationGuide(
  destinationName: string,
  language: "zh" | "en" = "zh"
): Promise<GuideSection[]> {
  const key = cacheKey(destinationName, language);

  // 1. Check cache — stored as clean JSON { sections: [...] }
  const cached = getCachedGuide(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.sections?.length > 0) {
        return (parsed.sections as GuideSection[]).sort(
          (a, b) => a.order - b.order
        );
      }
    } catch {
      // Corrupted cache entry — clear and regenerate
    }
  }

  // 2. Generate from DeepSeek
  try {
    const systemPrompt = buildDestinationSystemPrompt();
    const userMessage = buildDestinationUserMessage(destinationName);
    const rawContent = await chat(systemPrompt, userMessage, {
      temperature: 0.7,
      max_tokens: 4096,
    });

    const parsed = extractJson(rawContent);
    if (parsed?.sections && parsed.sections.length > 0) {
      // Cache the CLEAN JSON (re-serialized, guaranteed parseable next time)
      setCachedGuide(key, JSON.stringify({ sections: parsed.sections }));

      return (parsed.sections as GuideSection[]).sort(
        (a, b) => a.order - b.order
      );
    }
  } catch (error) {
    console.error(`Guide generation failed for ${destinationName}:`, error);
  }

  return [];
}
