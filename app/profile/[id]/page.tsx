'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BookOpen, MessageSquare, Users, Mail } from 'lucide-react';
import { PostCard } from '@/components/forum/PostCard';

export default function ProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchUserPosts();
      fetchStats();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, reputation_points)
        `)
        .eq('author_id', profileId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesRes, commentsRes] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
          ]);

          return {
            ...post,
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            tags: [],
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [postsRes, commentsRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }).eq('author_id', profileId),
        supabase.from('comments').select('id', { count: 'exact' }).eq('author_id', profileId),
      ]);

      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', profileId);

      const postIds = userPosts?.map(p => p.id) || [];

      let likesCount = 0;
      if (postIds.length > 0) {
        const { count } = await supabase
          .from('likes')
          .select('id', { count: 'exact' })
          .in('post_id', postIds);
        likesCount = count || 0;
      }

      setStats({
        postsCount: postsRes.count || 0,
        commentsCount: commentsRes.count || 0,
        likesReceived: likesCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Profile not found</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                      <p className="text-muted-foreground">{profile.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{profile.role}</Badge>
                      <Badge variant="outline">
                        <Award className="mr-1 h-3 w-3" />
                        {profile.reputation_points} reputation
                      </Badge>
                      {profile.field_of_study && (
                        <Badge variant="secondary">{profile.field_of_study}</Badge>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground">{profile.bio}</p>
                    )}
                    {user?.id !== profileId && (
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Users className="mr-2 h-4 w-4" />
                          Add Friend
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.postsCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comments</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.commentsCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Likes Received</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.likesReceived}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="posts" className="w-full">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="space-y-4 mt-6">
                {posts.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No posts yet</p>
                  </Card>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </TabsContent>
              <TabsContent value="comments" className="mt-6">
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Comments coming soon</p>
                </Card>
              </TabsContent>
              <TabsContent value="activity" className="mt-6">
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Activity feed coming soon</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
