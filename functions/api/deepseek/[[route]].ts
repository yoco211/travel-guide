// Cloudflare Pages Function — proxies API requests to the Worker backend
// Solves CORS and secret access issues: browser calls same origin, Function forwards to Worker

const API_WORKER = "https://travel-guide-api.travel-guide-cn.workers.dev";

export async function onRequest(ctx: { request: Request }) {
  const { request } = ctx;
  const url = new URL(request.url);

  // Forward to the API Worker
  const workerUrl = `${API_WORKER}${url.pathname}`;
  const forwarded = new Request(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
  });

  const response = await fetch(forwarded);
  return response;
}
