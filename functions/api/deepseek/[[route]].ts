// Cloudflare Pages Function for /api/deepseek/*
// Uses native fetch to avoid npm package compatibility issues

interface GuideSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

// ---- DeepSeek API via fetch ----
async function chat(
  apiKey: string,
  baseUrl: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty response");
  return content;
}

// ---- JSON Extraction ----
function extractJson(raw: string): { sections?: GuideSection[] } | null {
  try { return JSON.parse(raw); } catch {}
  try {
    const m = raw.match(/\{[\s\S]*"sections"[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  } catch {}
  try {
    const stripped = raw
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/, "")
      .trim();
    return JSON.parse(stripped);
  } catch {}
  return null;
}

// ---- Prompts ----
const DEST_SYSTEM = `你是一位资深的当地导游。
请根据用户提供的目的地名称，生成一份详细的旅游攻略。

输出必须是严格的 JSON 格式：
{
  "sections": [
    { "id": "overview", "title": "目的地概览", "content": "Markdown...", "order": 1 },
    { "id": "attractions", "title": "必游景点", "content": "Markdown...", "order": 2 },
    { "id": "food", "title": "美食推荐", "content": "Markdown...", "order": 3 },
    { "id": "transport", "title": "交通指南", "content": "Markdown...", "order": 4 },
    { "id": "accommodation", "title": "住宿选择", "content": "Markdown...", "order": 5 },
    { "id": "tips", "title": "旅行贴士", "content": "Markdown...", "order": 6 }
  ]
}
每个 content 用中文 Markdown 格式，至少 200 字，内容详实。`;

const PLAN_SYSTEM = `你是一位资深旅行规划师。根据用户需求生成个性化旅游攻略。

输出必须为严格 JSON：
{
  "sections": [
    { "id": "overview", "title": "目的地概览", "content": "...", "order": 1 },
    { "id": "attractions", "title": "景点推荐", "content": "...", "order": 2 },
    { "id": "food", "title": "美食指南", "content": "...", "order": 3 },
    { "id": "transport_from_origin", "title": "出发地→目的地 交通详情", "content": "...", "order": 4 },
    { "id": "transport", "title": "当地交通攻略", "content": "...", "order": 5 },
    { "id": "accommodation", "title": "住宿推荐", "content": "...", "order": 5 },
    { "id": "itinerary", "title": "行程建议", "content": "...", "order": 6 },
    { "id": "tips", "title": "实用贴士", "content": "...", "order": 7 }
  ]
}
所有 content 用中文 Markdown，每个至少 300 字。`;

// ---- Simple Cache ----
const cache = new Map<string, { data: string; ts: number }>();
const TTL = 6 * 60 * 60 * 1000;

function cacheGet(key: string): string | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL) { cache.delete(key); return null; }
  return e.data;
}
function cacheSet(key: string, data: string): void {
  if (cache.size > 200) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, { data, ts: Date.now() });
}

// ---- Rate Limiting ----
const rl = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const e = rl.get(key);
  if (!e || now > e.resetAt) { rl.set(key, { count: 1, resetAt: now + 60000 }); return true; }
  if (e.count >= 20) return false;
  e.count++;
  return true;
}

// ---- CORS ----
function cors(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ---- Main Handler ----
export async function onRequest(ctx: {
  request: Request;
  env: Record<string, string>;
}) {
  const { request, env } = ctx;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }

  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: { code: "METHOD_NOT_ALLOWED", message: "仅支持 POST" } },
      { status: 405, headers: cors() }
    );
  }

  // Rate limit
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const path = new URL(request.url).pathname;
  if (!checkRateLimit(`${ip}:${path}`)) {
    return Response.json(
      { success: false, error: { code: "RATE_LIMITED", message: "请求太频繁" } },
      { status: 429, headers: cors() }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return Response.json(
      { success: false, error: { code: "INVALID_JSON", message: "JSON 格式无效" } },
      { status: 400, headers: cors() }
    );
  }

  const apiKey = env.DEEPSEEK_API_KEY;
  const baseUrl = env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  if (!apiKey) {
    return Response.json(
      { success: false, error: { code: "CONFIG_ERROR", message: "API Key 未配置" } },
      { status: 500, headers: cors() }
    );
  }

  try {
    if (path.includes("/guide")) return handleGuide(body, apiKey, baseUrl);
    if (path.includes("/plan")) return handlePlan(body, apiKey, baseUrl);
    if (path.includes("/search")) return handleSearch(body);

    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "未知 API" } },
      { status: 404, headers: cors() }
    );
  } catch (err) {
    console.error("API error:", String(err));
    return Response.json(
      { success: false, error: { code: "AI_ERROR", message: "AI 生成失败，请稍后重试" } },
      { status: 500, headers: cors() }
    );
  }
}

// ---- Handlers ----

async function handleGuide(
  body: Record<string, unknown>,
  apiKey: string,
  baseUrl: string
) {
  const destination = String(body.destination || "").trim();
  if (!destination || destination.length > 100) {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "目的地无效" } },
      { status: 400, headers: cors() }
    );
  }

  const ck = `guide:${destination}`;
  const cached = cacheGet(ck);
  if (cached) {
    try {
      const p = JSON.parse(cached);
      if (p.sections?.length > 0) {
        return Response.json({ success: true, data: p }, { headers: cors() });
      }
    } catch {}
  }

  const raw = await chat(apiKey, baseUrl, DEST_SYSTEM, `请为 ${destination} 生成一份详细的旅游攻略。`);
  const parsed = extractJson(raw);

  if (!parsed?.sections?.length) {
    return Response.json(
      { success: false, error: { code: "AI_ERROR", message: "AI 返回异常" } },
      { status: 500, headers: cors() }
    );
  }

  cacheSet(ck, JSON.stringify({ sections: parsed.sections }));
  return Response.json(
    { success: true, data: { sections: parsed.sections } },
    { headers: cors() }
  );
}

async function handlePlan(
  body: Record<string, unknown>,
  apiKey: string,
  baseUrl: string
) {
  const destination = String(body.destination || "").trim();
  if (!destination) {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "目的地不能为空" } },
      { status: 400, headers: cors() }
    );
  }

  const budgetLabels: Record<string, string> = {
    budget: "经济实惠", "mid-range": "舒适中档", luxury: "奢华享受",
  };
  const styleLabels: Record<string, string> = {
    solo: "独自旅行", couple: "情侣出游", family: "家庭出行", friends: "朋友结伴",
  };

  const b = body as Record<string, unknown>;
  const interests = (b.interests as string[] || []).join("、");
  const userMsg = [
    `出发地：${b.origin || "未指定"}`,
    `目的地：${destination}`,
    `日期：${(b.dates as Record<string,string>)?.from || "?"} 至 ${(b.dates as Record<string,string>)?.to || "?"}`,
    `预算：${budgetLabels[String(b.budget || "mid-range")] || b.budget}`,
    `兴趣：${interests || "未指定"}`,
    `方式：${styleLabels[String(b.travelStyle || "solo")] || b.travelStyle}`,
    b.additionalNotes ? `备注：${b.additionalNotes}` : "",
  ].filter(Boolean).join("\n");

  const raw = await chat(apiKey, baseUrl, PLAN_SYSTEM, `请为以下旅行需求生成攻略：\n${userMsg}`, 4096);
  const parsed = extractJson(raw);

  if (!parsed?.sections?.length) {
    return Response.json(
      { success: false, error: { code: "AI_ERROR", message: "AI 返回异常" } },
      { status: 500, headers: cors() }
    );
  }

  return Response.json(
    { success: true, data: { sections: parsed.sections } },
    { headers: cors() }
  );
}

async function handleSearch(body: Record<string, unknown>) {
  const query = String(body.query || "").trim();
  return Response.json({
    success: true,
    data: { results: [], message: query ? `搜索"${query}"：请浏览目的地列表` : "请输入搜索词" },
  }, { headers: cors() });
}
