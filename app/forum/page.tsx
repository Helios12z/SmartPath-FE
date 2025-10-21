'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PostCard } from '@/components/forum/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, TrendingUp, Clock, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { mockStore } from '@/lib/mockStore';

type PostWithMeta = ReturnType<typeof mapPostWithMeta>;

const mapPostWithMeta = (
  post: ReturnType<typeof mockStore.getPosts>[number],
  context: {
    users: ReturnType<typeof mockStore.getUsers>;
    reactions: ReturnType<typeof mockStore.getReactions>;
    comments: ReturnType<typeof mockStore.getComments>;
    categories: ReturnType<typeof mockStore.getCategories>;
    categoryRelations: ReturnType<typeof mockStore.getCategoryPostRelations>;
    badgesByUser: Map<string, ReturnType<typeof mockStore.getHighestBadgeForUser>>;
  }
) => {
  const author = context.users.find((user) => user.id === post.author_id);
  const positiveReactions = context.reactions.filter(
    (reaction) => reaction.post_id === post.id && reaction.is_positive
  );
  const postComments = context.comments.filter((comment) => comment.post_id === post.id);
  const postCategories = context.categoryRelations
    .filter((relation) => relation.post_id === post.id)
    .map((relation) => context.categories.find((category) => category.id === relation.category_id))
    .filter(Boolean)
    .map((category) => ({
      id: category!.id,
      name: category!.name,
      color: 'blue',
    }));

  return {
    ...post,
    author: author
      ? {
          id: author.id,
          full_name: author.full_name,
          avatar_url: author.avatar_url,
          reputation_points: author.reputation_points,
          primaryBadge: context.badgesByUser.get(author.id) ?? null,
        }
      : {
          id: post.author_id,
          full_name: 'Unknown User',
          avatar_url: null,
          reputation_points: 0,
          primaryBadge: null,
        },
    likes_count: positiveReactions.length,
    comments_count: postComments.length,
    tags: postCategories,
  };
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export default function ForumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(() => {
    try {
      const context = {
        users: mockStore.getUsers(),
        reactions: mockStore.getReactions(),
        comments: mockStore.getComments(),
        categories: mockStore.getCategories(),
        categoryRelations: mockStore.getCategoryPostRelations(),
        badgesByUser: new Map<string, ReturnType<typeof mockStore.getHighestBadgeForUser>>(),
      };

      context.users.forEach((user) => {
        context.badgesByUser.set(user.id, mockStore.getHighestBadgeForUser(user.id));
      });

      const postsWithMeta = mockStore
        .getPosts()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map((post) => mapPostWithMeta(post, context));

      setPosts(postsWithMeta);
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
  }, [toast]);

  const fetchUserLikes = useCallback(() => {
    try {
      const userReactions = mockStore
        .getReactions()
        .filter((reaction) => reaction.user_id === user?.id && reaction.is_positive);

      setUserLikes(new Set(userReactions.map((reaction) => reaction.post_id)));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    } else {
      setUserLikes(new Set());
    }
  }, [user, fetchUserLikes]);

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    const reactions = mockStore.getReactions();
    const existingReaction = reactions.find(
      (reaction) =>
        reaction.post_id === postId &&
        reaction.user_id === user.id &&
        reaction.is_positive
    );

    if (existingReaction) {
      mockStore.removeReaction(
        (reaction) => reaction.id === existingReaction.id
      );
      setUserLikes((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      toast({
        title: 'Success',
        description: 'Removed like',
      });
    } else {
      mockStore.addReaction({
        id: generateId(),
        post_id: postId,
        user_id: user.id,
        is_positive: true,
        created_at: new Date().toISOString(),
      });
      setUserLikes((prev) => new Set(prev).add(postId));
      toast({
        title: 'Success',
        description: 'Post liked',
      });
    }

    fetchPosts();
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
