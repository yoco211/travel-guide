// Standalone Cloudflare Worker for TravelGuide API
// Routes: /api/deepseek/guide, /api/deepseek/plan, /api/deepseek/search

interface GuideSection { id: string; title: string; content: string; order: number; }

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const h = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (request.method !== "POST") return Response.json({ success: false, error: { code: "METHOD_NOT_ALLOWED" } }, { status: 405, headers: h });

    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    if (!rl(`${ip}:${path}`)) return Response.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429, headers: h });

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return Response.json({ success: false, error: { code: "INVALID_JSON" } }, { status: 400, headers: h });
    }

    const apiKey = env.DEEPSEEK_API_KEY;
    const baseUrl = (env.DEEPSEEK_BASE_URL as string) || "https://api.deepseek.com";
    if (!apiKey) return Response.json({ success: false, error: { code: "CONFIG_ERROR" } }, { status: 500, headers: h });

    try {
      if (path.includes("/guide")) return await handleGuide(body, apiKey, baseUrl, h);
      if (path.includes("/plan")) return await handlePlan(body, apiKey, baseUrl, h);
      if (path.includes("/search")) return Response.json({ success: true, data: { results: [] } }, { headers: h });
      return Response.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404, headers: h });
    } catch (err) {
      console.error(String(err));
      return Response.json({ success: false, error: { code: "AI_ERROR", message: "AI 生成失败" } }, { status: 500, headers: h });
    }
  },
};

// ---- Rate Limiting ----
const rateMap = new Map<string, { count: number; resetAt: number }>();
function rl(key: string): boolean {
  const now = Date.now();
  const e = rateMap.get(key);
  if (!e || now > e.resetAt) { rateMap.set(key, { count: 1, resetAt: now + 60000 }); return true; }
  if (e.count >= 20) return false;
  e.count++; return true;
}

// ---- Cache ----
const cache = new Map<string, { data: string; ts: number }>();
const TTL = 6 * 60 * 60 * 1000;
function cGet(k: string): string | null {
  const e = cache.get(k);
  if (!e || Date.now() - e.ts > TTL) { cache.delete(k); return null; }
  return e.data;
}
function cSet(k: string, d: string): void {
  if (cache.size > 200) { const f = cache.keys().next().value; if (f) cache.delete(f); }
  cache.set(k, { data: d, ts: Date.now() });
}

// ---- DeepSeek ----
async function dsChat(apiKey: string, baseUrl: string, system: string, user: string, maxTok = 4096): Promise<string> {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", temperature: 0.7, max_tokens: maxTok, messages: [{ role: "system", content: system }, { role: "user", content: user }], response_format: { type: "json_object" } }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const d = await res.json() as { choices: Array<{ message: { content: string } }> };
  const c = d.choices?.[0]?.message?.content;
  if (!c) throw new Error("Empty");
  return c;
}

function extract(raw: string): { sections?: GuideSection[] } | null {
  try { return JSON.parse(raw); } catch {}
  try { const m = raw.match(/\{[\s\S]*"sections"[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
  try { return JSON.parse(raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "").trim()); } catch {}
  return null;
}

const DEST_PROMPT = `你是资深当地导游。生成JSON攻略：
{"sections":[{"id":"overview","title":"目的地概览","content":"...","order":1},{"id":"attractions","title":"必游景点","content":"...","order":2},{"id":"food","title":"美食推荐","content":"...","order":3},{"id":"transport","title":"交通指南","content":"...","order":4},{"id":"accommodation","title":"住宿选择","content":"...","order":5},{"id":"tips","title":"旅行贴士","content":"...","order":6}]}
每个content用中文Markdown，至少200字。`;

const PLAN_PROMPT = `你是资深旅行规划师。生成JSON攻略：
{"sections":[{"id":"overview","title":"目的地概览","content":"...","order":1},{"id":"attractions","title":"景点推荐","content":"...","order":2},{"id":"food","title":"美食指南","content":"...","order":3},{"id":"transport_from_origin","title":"出发地→目的地 交通详情","content":"...","order":4},{"id":"transport","title":"当地交通攻略","content":"...","order":5},{"id":"accommodation","title":"住宿推荐","content":"...","order":5},{"id":"itinerary","title":"行程建议","content":"...","order":6},{"id":"tips","title":"实用贴士","content":"...","order":7}]}
所有content用中文Markdown，每个至少300字。`;

async function handleGuide(body: Record<string, unknown>, apiKey: string, baseUrl: string, h: Record<string, string>) {
  const dest = String(body.destination || "").trim();
  if (!dest || dest.length > 100) return Response.json({ success: false, error: { code: "INVALID_INPUT" } }, { status: 400, headers: h });
  const ck = `guide:${dest}`;
  const cached = cGet(ck);
  if (cached) { try { const p = JSON.parse(cached); if (p.sections?.length > 0) return Response.json({ success: true, data: p }, { headers: h }); } catch {} }
  const raw = await dsChat(apiKey, baseUrl, DEST_PROMPT, `请为 ${dest} 生成一份详细的旅游攻略。`);
  const parsed = extract(raw);
  if (!parsed?.sections?.length) return Response.json({ success: false, error: { code: "AI_ERROR" } }, { status: 500, headers: h });
  cSet(ck, JSON.stringify({ sections: parsed.sections }));
  return Response.json({ success: true, data: { sections: parsed.sections } }, { headers: h });
}

async function handlePlan(body: Record<string, unknown>, apiKey: string, baseUrl: string, h: Record<string, string>) {
  const dest = String(body.destination || "").trim();
  if (!dest) return Response.json({ success: false, error: { code: "INVALID_INPUT" } }, { status: 400, headers: h });
  const b = body as Record<string, unknown>;
  const bl: Record<string, string> = { budget: "经济实惠", "mid-range": "舒适中档", luxury: "奢华享受" };
  const sl: Record<string, string> = { solo: "独自旅行", couple: "情侣出游", family: "家庭出行", friends: "朋友结伴" };
  const msg = [`出发地：${b.origin || "?"}`, `目的地：${dest}`, `日期：${(b.dates as Record<string,string>)?.from || "?"} 至 ${(b.dates as Record<string,string>)?.to || "?"}`, `预算：${bl[String(b.budget || "mid-range")] || b.budget}`, `兴趣：${(b.interests as string[] || []).join("、") || "?"}`, `方式：${sl[String(b.travelStyle || "solo")] || b.travelStyle}`, b.additionalNotes ? `备注：${b.additionalNotes}` : ""].filter(Boolean).join("\n");
  const raw = await dsChat(apiKey, baseUrl, PLAN_PROMPT, `请为以下旅行需求生成攻略：\n${msg}`, 4096);
  const parsed = extract(raw);
  if (!parsed?.sections?.length) return Response.json({ success: false, error: { code: "AI_ERROR" } }, { status: 500, headers: h });

  // Return SSE stream for progressive rendering
  const encoder = new TextEncoder();
  const sections = parsed.sections.sort((a, b) => a.order - b.order);

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "section_updated", sectionId: s.id, sectionTitle: s.title, content: s.content })}\n\n`
        ));
        if (i < sections.length - 1) {
          // Small delay between sections for progressive-rendering effect
          await new Promise(r => setTimeout(r, 200));
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "guide_complete" })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...h, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
  });
}
