import { searchRequestSchema } from "@/lib/validators";
import { searchSite } from "@/data/search";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: { code: "INVALID_JSON", message: "请求格式无效" } },
      { status: 400 }
    );
  }

  const result = searchRequestSchema.safeParse(body);
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

  const { query } = result.data;

  const matches = searchSite(query).slice(0, 10);

  return Response.json({
    success: true,
    data: matches,
  });
}
