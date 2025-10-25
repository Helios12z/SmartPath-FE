'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { friendshipAPI } from '@/lib/api/friendshipAPI';
import { userAPI } from '@/lib/api/userAPI';
import type { UserProfile } from '@/lib/types';

type FriendSummaryDto = {
  id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string | null;
  point?: number;
  primaryBadge?: { id: string; name: string } | null;
  isMutual?: boolean;
};

export default function FriendsPage() {
  const { toast } = useToast();

  const [friends, setFriends] = useState<FriendSummaryDto[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(true);

  const currentUserId: string | undefined = undefined;

  const friendIds = useMemo(() => new Set(friends.map(f => f.id)), [friends]);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const data = await friendshipAPI.getMine();
      setFriends((data ?? []).map(x => ({
        id: x.id,
        username: (x as any).username,
        fullName: (x as any).fullName,
        avatarUrl: (x as any).avatarUrl,
        point: (x as any).point,
        primaryBadge: (x as any).primaryBadge,
        isMutual: (x as any).isMutual,
      })));
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Failed to load friends', variant: 'destructive' });
    } finally {
      setLoadingFriends(false);
    }
  };

  // Load suggestions: lấy tất cả users, lọc bỏ bản thân + bạn bè hiện có
  const loadSuggestions = async () => {
    try {
      setLoadingSuggest(true);
      const all = await userAPI.getAll();
      const filtered = all.filter(u => !friendIds.has(u.id) && u.id !== currentUserId);
      // (Optional) sort gợi ý theo điểm giảm dần cho đẹp
      filtered.sort((a, b) => (b.point ?? 0) - (a.point ?? 0));
      setSuggestions(filtered);
    } catch (e: any) {
      setSuggestions([]);
      toast({ title: 'Error', description: e?.message ?? 'Failed to load suggestions', variant: 'destructive' });
    } finally {
      setLoadingSuggest(false);
    }
  };

  useEffect(() => { loadFriends(); }, []);
  useEffect(() => { loadSuggestions(); /* mỗi khi friends đổi thì làm tươi suggestions */ 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends]);

  // Actions
  const [workingIds, setWorkingIds] = useState<Record<string, boolean>>({});

  const handleFollow = async (userId: string) => {
    if (workingIds[userId]) return;
    setWorkingIds(prev => ({ ...prev, [userId]: true }));
    try {
      await friendshipAPI.follow({ followedUserId: userId });
      toast({ title: 'Success', description: 'Followed user' });
      await loadFriends();
      await loadSuggestions();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Failed to follow', variant: 'destructive' });
    } finally {
      setWorkingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (workingIds[userId]) return;
    setWorkingIds(prev => ({ ...prev, [userId]: true }));
    try {
      await friendshipAPI.cancelFollow(userId);
      toast({ title: 'Success', description: 'Unfollowed user' });
      await loadFriends();
      await loadSuggestions();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Failed to unfollow', variant: 'destructive' });
    } finally {
      setWorkingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Pending requests: placeholder — chờ backend accept/decline
  const pendingRequests: any[] = [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Friends</h1>
              <p className="text-muted-foreground">Connect with other students</p>
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">
                  <Users className="mr-2 h-4 w-4" />
                  All Friends ({loadingFriends ? '…' : friends.length})
                </TabsTrigger>
                <TabsTrigger value="requests">Requests (0)</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              {/* All Friends */}
              <TabsContent value="all" className="space-y-4 mt-6">
                {loadingFriends ? (
                  <Card><CardContent className="p-12 text-center">Loading friends…</CardContent></Card>
                ) : friends.length === 0 ? (
                  <Card><CardContent className="p-12 text-center">No friends yet</CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <Card key={friend.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={friend.avatarUrl ?? undefined} alt={friend.fullName ?? friend.username ?? ''} />
                              <AvatarFallback>{(friend.fullName ?? friend.username ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Link href={`/profile/${friend.id}`} className="font-medium hover:underline">
                                {friend.fullName ?? friend.username ?? 'Unknown'}
                              </Link>
                              <div className="mt-1 flex items-center justify-center gap-2">
                                {friend.primaryBadge?.name && <Badge variant="secondary">{friend.primaryBadge.name}</Badge>}
                                {typeof friend.point === 'number' && <Badge variant="outline">{friend.point} pts</Badge>}
                              </div>
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button asChild variant="outline" size="sm" className="flex-1">
                                <Link href={`/profile/${friend.id}`}>View Profile</Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1"
                                onClick={() => handleUnfollow(friend.id)}
                                disabled={!!workingIds[friend.id]}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Unfollow
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Requests (placeholder) */}
              <TabsContent value="requests" className="space-y-4 mt-6">
                <Card><CardContent className="p-12 text-center">No pending requests</CardContent></Card>
              </TabsContent>

              {/* Suggestions (không paging) */}
              <TabsContent value="suggestions" className="space-y-6 mt-6">
                {loadingSuggest ? (
                  <Card><CardContent className="p-12 text-center">Loading suggestions…</CardContent></Card>
                ) : suggestions.length === 0 ? (
                  <Card><CardContent className="p-12 text-center">No suggestions</CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map((u) => {
                      const isFriend = friendIds.has(u.id);
                      return (
                        <Card key={u.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Avatar className="h-20 w-20">
                                {/* UserProfile trong code của bạn đang dùng camelCase: fullName, avatarUrl */}
                                <AvatarImage src={u.avatarUrl ?? undefined} alt={u.fullName ?? ''} />
                                <AvatarFallback>{u.fullName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <Link href={`/profile/${u.id}`} className="font-medium hover:underline">
                                  {u.fullName}
                                </Link>
                                {typeof u.point === 'number' && (
                                  <Badge variant="secondary" className="mt-1">{u.point} pts</Badge>
                                )}
                              </div>
                              <div className="flex gap-2 w-full">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                  <Link href={`/profile/${u.id}`}>View Profile</Link>
                                </Button>
                                {isFriend ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => handleUnfollow(u.id)}
                                    disabled={!!workingIds[u.id]}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Unfollow
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleFollow(u.id)}
                                    disabled={!!workingIds[u.id]}
                                  >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Friend
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
