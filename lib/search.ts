export type SearchResult = {
  slug: string;
  kind?: "destination" | "attraction";
};

export type SearchNavigation =
  | { kind: "destination"; slug: string }
  | { kind: "attraction"; slug: string }
  | { kind: "search"; query: string }
  | null;

export function getSearchNavigation(
  query: string,
  results: SearchResult[],
  selectedIndex: number
): SearchNavigation {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return null;

  if (selectedIndex >= 0 && selectedIndex < results.length) {
    return {
      kind: results[selectedIndex].kind ?? "destination",
      slug: results[selectedIndex].slug,
    };
  }

  return { kind: "search", query: trimmedQuery };
}
