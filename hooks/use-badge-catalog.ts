import { useEffect, useState } from 'react';
import { badgeAPI } from '@/lib/api/badgeAPI';

export type BadgeLite = { id: string; name: string; point: number; description?: string | null };

export function useBadgesCatalog() {
  const [badges, setBadges] = useState<BadgeLite[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await badgeAPI.getAll(); 
        if (alive) setBadges((list ?? []).sort((a, b) => a.point - b.point));
      } catch { /* ignore */ }
    })();
    return () => { alive = false; };
  }, []);
  return badges;
}

export function pickPrimaryBadgeByPoints(badges: BadgeLite[], points?: number | null) {
  if (!badges?.length || points == null) return null;
  let best: BadgeLite | null = null;
  for (const b of badges) if (b.point <= points) best = b;
  return best;
}
