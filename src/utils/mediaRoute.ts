export type RouteMediaType = 'movie' | 'tv';

export const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop';

export const FALLBACK_BACKDROP =
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop';

export function parseRemoteMediaId(value: string): { mediaType: RouteMediaType; tmdbId: number } | null {
  const match = /^(movie|tv)-(\d+)$/.exec(value);

  if (!match) {
    return null;
  }

  return {
    mediaType: match[1] as RouteMediaType,
    tmdbId: Number.parseInt(match[2], 10),
  };
}
