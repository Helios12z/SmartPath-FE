'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgePill } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockStore } from '@/lib/mockStore';
import { useAuth } from '@/context/AuthContext';
import type { Badge, UserAchievement } from '@/lib/types';
import { Trophy, Medal, Flame, Target } from 'lucide-react';

type BadgeWithStatus = Badge & {
  earned: boolean;
  awarded_at?: string;
  note?: string;
};

export default function AchievementsPage() {
  const { profile } = useAuth();

  const badges = useMemo(
    () =>
      mockStore
        .getBadges()
        .sort((a, b) => a.point - b.point),
    [],
  );

  const achievements = useMemo<UserAchievement[]>(
    () =>
      mockStore
        .getUserAchievements(profile?.id)
        .sort(
          (a, b) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime(),
        ),
    [profile?.id],
  );

  const earnedBadgeIds = useMemo(
    () => new Set(achievements.map((achievement) => achievement.badge_id)),
    [achievements],
  );

  const badgesWithStatus: BadgeWithStatus[] = useMemo(
    () =>
      badges.map((badge) => {
        const earned = earnedBadgeIds.has(badge.id);
        const achievement = achievements.find((item) => item.badge_id === badge.id);
        return {
          ...badge,
          earned,
          awarded_at: achievement?.awarded_at,
          note: achievement?.note,
        };
      }),
    [badges, achievements, earnedBadgeIds],
  );

  const totalReputation = profile?.reputation_points ?? 0;
  const earnedCount = badgesWithStatus.filter((badge) => badge.earned).length;
  const nextBadge = badgesWithStatus.find((badge) => !badge.earned);
  const previousBadge =
    badgesWithStatus
      .filter((badge) => badge.earned)
      .sort((a, b) => a.point - b.point)
      .at(-1) ?? null;

  const progressToNext = (() => {
    if (!nextBadge) return 100;
    const prevPoint = previousBadge?.point ?? 0;
    const range = nextBadge.point - prevPoint;
    if (range === 0) return 100;
    const progress = totalReputation - prevPoint;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-8">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6" />
                <div>
                  <CardTitle className="text-2xl font-bold">Your Achievement Journey</CardTitle>
                  <p className="text-blue-50">
                    Track your progress and celebrate milestones as you contribute to SmartPath.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-blue-100">Reputation points</p>
                <p className="text-3xl font-semibold">{totalReputation}</p>
                <p className="text-sm text-blue-100">
                  {nextBadge
                    ? `${nextBadge.point - totalReputation} points away from ${nextBadge.name}`
                    : 'You reached the highest tier!'}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-100">Badges earned</p>
                <p className="text-3xl font-semibold">{earnedCount}</p>
                <p className="text-sm text-blue-100">
                  {badges.length - earnedCount} more to collect
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-100">Progress to next badge</p>
                <Progress value={progressToNext} className="h-2 bg-blue-400/50" />
                <p className="text-sm text-blue-100 mt-2">
                  {nextBadge
                    ? `You're ${progressToNext.toFixed(0)}% of the way to ${nextBadge.name}.`
                    : 'You have unlocked every badge. Incredible!'}
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Badge Collection</h2>
              <BadgePill variant="secondary">{badges.length}</BadgePill>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badgesWithStatus.map((badge) => (
                <Card
                  key={badge.id}
                  className={`border ${
                    badge.earned
                      ? 'border-amber-400 shadow-lg shadow-amber-200/40 dark:shadow-amber-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Medal
                          className={`h-5 w-5 ${
                            badge.earned ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <CardTitle className="text-lg font-semibold">
                          {badge.name}
                        </CardTitle>
                      </div>
                      <BadgePill variant={badge.earned ? 'default' : 'outline'}>
                        {badge.point} pts
                      </BadgePill>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>
                        {badge.earned
                          ? 'Unlocked'
                          : `${Math.max(badge.point - totalReputation, 0)} points to unlock`}
                      </span>
                    </div>
                    {badge.earned ? (
                      <div className="text-xs text-muted-foreground">
                        <p>
                          Earned on {badge.awarded_at ? format(new Date(badge.awarded_at), 'PPP') : '—'}
                        </p>
                        {badge.note && <p className="mt-1 italic">“{badge.note}”</p>}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        <p>
                          Stay active in discussions, help peers, and share study resources to climb higher.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

  <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Milestone Timeline</h2>
              <BadgePill variant="outline">{achievements.length}</BadgePill>
            </div>
            {achievements.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-muted-foreground">
                  Start participating in the community to unlock your first badge.
                </p>
              </Card>
            ) : (
              <Card>
                <CardContent className="divide-y divide-slate-200 dark:divide-slate-800 p-0">
                  {achievements.map((achievement) => {
                    const badge = badges.find((item) => item.id === achievement.badge_id);
                    if (!badge) return null;
                    return (
                      <div key={achievement.id} className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{badge.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {achievement.note || 'Milestone unlocked through consistent contributions.'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(achievement.awarded_at), 'PPP')}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
