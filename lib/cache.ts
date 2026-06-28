import { LRUCache } from "lru-cache";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const guideCache = new LRUCache<string, CacheEntry<string>>({
  max: 100,
  ttl: 1000 * 60 * 60 * 6, // 6 hours default TTL
});

/**
 * Get cached guide content for a destination
 */
export function getCachedGuide(key: string): string | null {
  const entry = guideCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > 6 * 60 * 60 * 1000) {
    guideCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cached guide content
 */
export function setCachedGuide(key: string, data: string): void {
  guideCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Generate a cache key from destination name + language
 */
export function cacheKey(destination: string, language = "zh"): string {
  return `${language}:${destination.toLowerCase().trim()}`;
}

/**
 * Clear a specific cache entry
 */
export function clearCachedGuide(key: string): void {
  guideCache.delete(key);
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: guideCache.size,
    maxSize: guideCache.max,
  };
}
