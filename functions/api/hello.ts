export async function onRequest(ctx: { request: Request; env: Record<string, string> }) {
  const hasKey = !!ctx.env.DEEPSEEK_API_KEY;
  return Response.json({ ok: true, hasKey });
}
