import OpenAI from "openai";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

if (!DEEPSEEK_API_KEY) {
  console.warn(
    "⚠️ DEEPSEEK_API_KEY is not set. AI features will not work."
  );
}

const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: `${DEEPSEEK_BASE_URL}/v1`,
});

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

const DEFAULT_OPTIONS: ChatOptions = {
  model: "deepseek-chat",
  temperature: 0.7,
  max_tokens: 4096,
};

/**
 * Non-streaming chat completion
 */
export async function chat(
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const response = await client.chat.completions.create({
    model: opts.model!,
    temperature: opts.temperature!,
    max_tokens: opts.max_tokens!,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned empty response");
  }

  return content;
}

/**
 * Streaming chat completion — returns an async generator
 * that yields content chunks
 */
export async function* chatStream(
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): AsyncGenerator<string, void, unknown> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const stream = await client.chat.completions.create({
    model: opts.model!,
    temperature: opts.temperature!,
    max_tokens: opts.max_tokens!,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
