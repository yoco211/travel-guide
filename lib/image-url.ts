export function getImageUrl(imageUrl?: string): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    if (url.protocol !== "https:" || url.hostname === "source.unsplash.com") {
      return null;
    }
    return imageUrl;
  } catch {
    return null;
  }
}
