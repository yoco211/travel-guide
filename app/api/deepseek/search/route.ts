import { searchRequestSchema } from "@/lib/validators";
import { searchDestinations } from "@/data/destinations";
import type { SearchResult } from "@/types";

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

  // Local search with scoring
  const matches = searchDestinations(query)
    .slice(0, 10)
    .map<SearchResult>((dest) => {
      const q = query.toLowerCase();
      let score = 0;
      if (dest.name.toLowerCase().includes(q)) score += 0.5;
      if (dest.name.toLowerCase() === q) score += 0.5;
      if (dest.country.toLowerCase().includes(q)) score += 0.3;
      if (dest.description.toLowerCase().includes(q)) score += 0.1;
      if (dest.tags.some((t) => t.toLowerCase().includes(q))) score += 0.1;
      return {
        slug: dest.slug,
        name: dest.name,
        country: dest.country,
        matchScore: Math.min(score, 1),
        thumbnailUrl: dest.thumbnailUrl,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return Response.json({
    success: true,
    data: matches,
  });
}
