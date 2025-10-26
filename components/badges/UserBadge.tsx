'use client';

import { cn } from '@/lib/utils';
import type { Badge as BadgeMeta, BadgeAward } from '@/lib/types';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Sparkles, Medal, Trophy, Crown, Award as AwardIcon, LucideIcon } from 'lucide-react';

type UserBadgeProps = {
  badge?: BadgeMeta | BadgeAward | null;
  size?: 'sm' | 'md';
};

const iconMap: Record<string, LucideIcon> = {
  badge1: Sparkles,
  badge2: Medal,
  badge3: Trophy,
  badge4: Crown,
};

const styleMap: Record<string, string> = {
  badge1:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  badge2:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60',
  badge3:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/60',
  badge4:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/60',
};

const sizeMap = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
};

const iconSizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
};

export function UserBadge({ badge, size = 'sm' }: UserBadgeProps) {
  if (!badge) return null;

  const Icon = iconMap[badge.id] ?? AwardIcon;
  const styleClass = styleMap[badge.id] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return (
    <UiBadge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 font-medium border',
        sizeMap[size],
        styleClass,
      )}
    >
      <Icon className={iconSizeMap[size]} />
      <span className="truncate">{badge.name}</span>
    </UiBadge>
  );
}
