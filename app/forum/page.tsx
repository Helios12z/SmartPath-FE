'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PostCard } from '@/components/forum/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, TrendingUp, Clock, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ForumPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, reputation_points),
          subject:subjects(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesRes, commentsRes, tagsRes] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase
              .from('post_tags')
              .select('tag_id, tags(id, name, color)')
              .eq('post_id', post.id),
          ]);

          return {
            ...post,
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            tags: tagsRes.data?.map((t: any) => t.tags).filter(Boolean) || [],
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user?.id)
        .not('post_id', 'is', null);

      if (error) throw error;

      setUserLikes(new Set(data?.map((like) => like.post_id!) || []));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const isLiked = userLikes.has(postId);

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        setUserLikes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await supabase.from('likes').insert({
          user_id: user.id,
          post_id: postId,
        });

        setUserLikes((prev) => new Set(prev).add(postId));
      }

      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like',
        variant: 'destructive',
      });
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularPosts = [...filteredPosts].sort((a, b) => b.likes_count - a.likes_count);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground">Discuss topics and share knowledge</p>
        </div>
        <Link href="/forum/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
