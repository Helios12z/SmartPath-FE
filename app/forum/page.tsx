'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { postAPI } from '@/lib/api/postAPI';
import { reactionAPI } from '@/lib/api/reactionAPI';

import type { PostResponseDto } from '@/lib/types';
import { mapPostToUI } from '@/lib/mappers/postMapper';
import { UIPost } from '@/lib/mappers/postMapper';

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
  recommended: async () => postAPI.getAll(), // TODO: đổi sang endpoint recommend
};

export default function ForumPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rawPosts, setRawPosts] = useState<PostResponseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
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
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [strategy, profile?.id, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const uiPosts: UIPost[] = useMemo(() => rawPosts.map(mapPostToUI), [rawPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return uiPosts;
    return uiPosts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    );
  }, [uiPosts, searchQuery]);

  const popularPosts = useMemo(
    () => [...filteredPosts].sort((a, b) => b.likes_count - a.likes_count),
    [filteredPosts]
  );

  const handleLike = async (postId: string) => {
    if (!profile?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    const alreadyLiked = userLikes.has(postId);

    try {
      // optimistic
      setUserLikes((prev) => {
        const next = new Set(prev);
        alreadyLiked ? next.delete(postId) : next.add(postId);
        return next;
      });

      if (alreadyLiked) {
        await reactionAPI.remove(postId);
        toast({ title: 'Success', description: 'Removed like' });
      } else {
        await reactionAPI.react({ post_id: postId, is_positive: true });
        toast({ title: 'Success', description: 'Post liked' });
      }

      // (Tuỳ chọn) cập nhật reactionCount local cho mượt:
      // setRawPosts(cur => cur.map(p => p.id === postId
      //   ? { ...p, reactionCount: p.reactionCount + (alreadyLiked ? -1 : 1) }
      //   : p
      // ));
      // hoặc refetch: await fetchPosts();
    } catch (err) {
      // rollback
      setUserLikes((prev) => {
        const next = new Set(prev);
        alreadyLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Search */}
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

      {/* Tabs */}
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
                onLike={() => handleLike(post.id)}
                isLiked={userLikes.has(post.id)}
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
                onLike={() => handleLike(post.id)}
                isLiked={userLikes.has(post.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}