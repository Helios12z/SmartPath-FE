'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { postAPI } from '@/lib/api/postAPI';
import { reactionAPI } from '@/lib/api/reactionAPI';

import type { PostResponseDto } from '@/lib/types';
import { mapPostToUI, type UIPost } from '@/lib/mappers/postMapper';

import { PostCard } from '@/components/forum/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, TrendingUp, Clock, Filter } from 'lucide-react';

type PostFetchStrategy = 'all' | 'byUser' | 'recommended';

const FETCH_STRATEGIES: Record<
  PostFetchStrategy,
  (args?: { userId?: string }) => Promise<PostResponseDto[]>
> = {
  all: async () => postAPI.getAll(),
  byUser: async (args) => (args?.userId ? postAPI.getByUser(args.userId) : []),
  recommended: async () => postAPI.getAll(), // TODO: replace by recommendation endpoint
};

export default function ForumPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rawPosts, setRawPosts] = useState<PostResponseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [strategy, setStrategy] = useState<PostFetchStrategy>('all');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FETCH_STRATEGIES[strategy]({ userId: profile?.id });
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRawPosts(sorted);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast({ title: 'Error', description: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [strategy, profile?.id, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // map sang UI
  const uiPosts: UIPost[] = useMemo(() => rawPosts.map(mapPostToUI), [rawPosts]);

  // filter theo từ khóa
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return uiPosts;
    return uiPosts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    );
  }, [uiPosts, searchQuery]);

  // Popular: sort theo (positive - negative)
  const popularPosts = useMemo(
    () =>
      [...filteredPosts].sort(
        (a, b) =>
          (b.positiveReactionCount - b.negativeReactionCount) -
          (a.positiveReactionCount - a.negativeReactionCount)
      ),
    [filteredPosts]
  );

  type ReactionKind = 'like' | 'dislike';

  // helper cập nhật 1 post trong rawPosts
  const mutateLocal = (postId: string, updater: (p: PostResponseDto) => PostResponseDto) => {
    setRawPosts((cur) => cur.map((p) => (p.id === postId ? updater(p) : p)));
  };

  const handleReact = async (postId: string, kind: ReactionKind) => {
    if (!profile?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to react.',
        variant: 'destructive',
      });
      return;
    }

    const target = rawPosts.find((p) => p.id === postId);
    if (!target) return;

    const currPos = !!target.isPositiveReacted;
    const currNeg = !!target.isNegativeReacted;
    const wantPos = kind === 'like';
    const wantNeg = kind === 'dislike';

    // Xác định action
    // - Nếu user bấm lại cùng loại đang bật -> clear
    // - Nếu chưa có gì -> set theo muốn
    // - Nếu đang là loại khác -> chuyển sang loại muốn
    type Action = 'clear' | 'set-like' | 'set-dislike';
    let action: Action;

    if ((currPos && wantPos) || (currNeg && wantNeg)) {
      action = 'clear';
    } else if (wantPos) {
      action = 'set-like';
    } else {
      action = 'set-dislike';
    }

    const prev = { ...target };

    // cập nhật lạc quan counters & flags dựa trên action
    mutateLocal(postId, (p) => {
      let pos = p.positiveReactionCount ?? 0;
      let neg = p.negativeReactionCount ?? 0;
      let isPos: boolean | null = p.isPositiveReacted;
      let isNeg: boolean | null = p.isNegativeReacted;

      if (action === 'clear') {
        if (isPos) {
          pos = Math.max(0, pos - 1);
          isPos = null;
        } else if (isNeg) {
          neg = Math.max(0, neg - 1);
          isNeg = null;
        }
      } else if (action === 'set-like') {
        if (isNeg) {
          // chuyển từ dislike -> like
          neg = Math.max(0, neg - 1);
          pos = pos + 1;
        } else if (!isPos) {
          // từ neutral -> like
          pos = pos + 1;
        }
        isPos = true;
        isNeg = false;
      } else if (action === 'set-dislike') {
        if (isPos) {
          // chuyển từ like -> dislike
          pos = Math.max(0, pos - 1);
          neg = neg + 1;
        } else if (!isNeg) {
          // từ neutral -> dislike
          neg = neg + 1;
        }
        isPos = false;
        isNeg = true;
      }

      return {
        ...p,
        isPositiveReacted: isPos,
        isNegativeReacted: isNeg,
        positiveReactionCount: pos,
        negativeReactionCount: neg,
      };
    });

    try {
      if (action === 'clear') {
        await reactionAPI.removePost(postId);
        toast({ title: 'Success', description: 'Reaction cleared' });
      } else if (action === 'set-like') {
        await reactionAPI.react({ postId, isPositive: true });
        toast({ title: 'Success', description: 'Liked post' });
      } else {
        await reactionAPI.react({ postId, isPositive: false });
        toast({ title: 'Success', description: 'Disliked post' });
      }
    } catch (e) {
      // revert nếu fail
      mutateLocal(postId, () => prev);
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update reaction', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground">Discuss topics and share knowledge</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/forum/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" title="Filter (coming soon)">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="recent">
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="popular">
            <TrendingUp className="mr-2 h-4 w-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts found</p>
              <Link href="/forum/create">
                <Button className="mt-4">Create First Post</Button>
              </Link>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleReact(post.id, 'like')}
                onDislike={() => handleReact(post.id, 'dislike')}
                isLiked={post.isPositiveReacted === true}
                isDisliked={post.isNegativeReacted === true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading posts...</p>
            </div>
          ) : popularPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts found</p>
            </Card>
          ) : (
            popularPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleReact(post.id, 'like')}
                onDislike={() => handleReact(post.id, 'dislike')}
                isLiked={post.isPositiveReacted === true}
                isDisliked={post.isNegativeReacted === true}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}