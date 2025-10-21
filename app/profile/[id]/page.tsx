'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Award, BookOpen, MessageSquare, Users, Mail } from 'lucide-react';
import { PostCard } from '@/components/forum/PostCard';
import { mockStore } from '@/lib/mockStore';
import type { UserProfile, BadgeAward } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UserBadge } from '@/components/badges/UserBadge';

type ProfileStats = {
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
};

type PostWithMeta = ReturnType<typeof mapPostWithMeta>;

const buildAuthorSummary = (profile?: UserProfile | null) => ({
  id: profile?.id ?? 'unknown',
  full_name: profile?.full_name ?? 'Unknown User',
  avatar_url: profile?.avatar_url ?? '',
  reputation_points: profile?.reputation_points ?? 0,
  primaryBadge: profile ? mockStore.getHighestBadgeForUser(profile.id) : null,
});

const mapPostWithMeta = (
  post: ReturnType<typeof mockStore.getPosts>[number],
  context: {
    reactions: ReturnType<typeof mockStore.getReactions>;
    comments: ReturnType<typeof mockStore.getComments>;
    categories: ReturnType<typeof mockStore.getCategories>;
    categoryRelations: ReturnType<typeof mockStore.getCategoryPostRelations>;
    author: ReturnType<typeof buildAuthorSummary>;
  }
) => {
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
    author: context.author,
    likes_count: positiveReactions.length,
    comments_count: postComments.length,
    tags: postCategories,
  };
};

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { user, profile: authProfile, updateProfile: updateProfileDetails } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [primaryBadge, setPrimaryBadge] = useState<BadgeAward | null>(null);
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    full_name: '',
    avatar_url: '',
    field_of_study: '',
    bio: '',
    phone_number: '',
    username: '',
  });

  const loadProfile = useCallback(() => {
    setLoading(true);
    const profileRecord = mockStore.getUserById(profileId);

    if (!profileRecord) {
      setProfileData(null);
      setPrimaryBadge(null);
      setPosts([]);
      setStats({
        postsCount: 0,
        commentsCount: 0,
        likesReceived: 0,
      });
      setLoading(false);
      return;
    }

    const reactions = mockStore.getReactions();
    const comments = mockStore.getComments();
    const categories = mockStore.getCategories();
    const categoryRelations = mockStore.getCategoryPostRelations();
    const authorSummary = buildAuthorSummary(profileRecord);
    setPrimaryBadge(authorSummary.primaryBadge ?? null);

    const userPosts = mockStore
      .getPosts()
      .filter((post) => post.author_id === profileId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const postsWithMeta = userPosts.map((post) =>
      mapPostWithMeta(post, {
        reactions,
        comments,
        categories,
        categoryRelations,
        author: authorSummary,
      })
    );

    const likesReceived = reactions.filter(
      (reaction) =>
        reaction.is_positive && userPosts.some((post) => post.id === reaction.post_id)
    ).length;

    const commentsCount = comments.filter(
      (comment) => comment.author_id === profileId
    ).length;

    setProfileData(profileRecord);
    setPosts(postsWithMeta);
    setStats({
      postsCount: userPosts.length,
      commentsCount,
      likesReceived,
    });
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;

    loadProfile();
  }, [profileId, authProfile, loadProfile]);

  useEffect(() => {
    if (!isEditOpen || !profileData) return;

    setFormState({
      full_name: profileData.full_name ?? '',
      avatar_url: profileData.avatar_url ?? '',
      field_of_study: profileData.field_of_study ?? profileData.major ?? '',
      bio: profileData.bio ?? '',
      phone_number: profileData.phone_number ?? '',
      username: profileData.username ?? '',
    });
  }, [isEditOpen, profileData]);

  const isOwnProfile = user?.id === profileId;

  const handleEditSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileData) return;

    setSaving(true);
    try {
      const payload = {
        full_name: formState.full_name.trim() || profileData.full_name,
        avatar_url: formState.avatar_url.trim(),
        field_of_study: formState.field_of_study.trim(),
        bio: formState.bio.trim(),
        phone_number: formState.phone_number.trim(),
        username: formState.username.trim() || profileData.username || '',
      };

      const updatedProfile = await updateProfileDetails(payload);
      setProfileData(updatedProfile);
      loadProfile();
      setIsEditOpen(false);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error('Failed to update profile', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [formState, profileData, updateProfileDetails, loadProfile, toast]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </Card>
      );
    }

    if (!profileData) {
      return (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar_url ?? undefined} alt={profileData.full_name} />
                <AvatarFallback className="text-2xl">
                  {profileData.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  {primaryBadge && (
                    <div>
                      <UserBadge badge={primaryBadge} size="md" />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                  <p className="text-muted-foreground">{profileData.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{profileData.role}</Badge>
                  <Badge variant="outline">
                    <Award className="mr-1 h-3 w-3" />
                    {profileData.reputation_points} reputation
                  </Badge>
                  {(profileData.field_of_study || profileData.major) && (
                    <Badge variant="secondary">
                      {profileData.field_of_study || profileData.major}
                    </Badge>
                  )}
                </div>
                {profileData.bio && (
                  <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                )}
                {isOwnProfile ? (
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your avatar and personal information.
                        </DialogDescription>
                      </DialogHeader>
                      <form id="edit-profile-form" className="space-y-4" onSubmit={handleEditSubmit}>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formState.full_name}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, full_name: event.target.value }))
                            }
                            disabled={saving}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={formState.username}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, username: event.target.value }))
                            }
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="avatar_url">Avatar URL</Label>
                          <Input
                            id="avatar_url"
                            value={formState.avatar_url}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, avatar_url: event.target.value }))
                            }
                            disabled={saving}
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field_of_study">Field of Study</Label>
                          <Input
                            id="field_of_study"
                            value={formState.field_of_study}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, field_of_study: event.target.value }))
                            }
                            disabled={saving}
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Phone Number</Label>
                          <Input
                            id="phone_number"
                            value={formState.phone_number}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, phone_number: event.target.value }))
                            }
                            disabled={saving}
                            placeholder="+1234567890"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formState.bio}
                            onChange={(event) =>
                              setFormState((prev) => ({ ...prev, bio: event.target.value }))
                            }
                            disabled={saving}
                            rows={4}
                            placeholder="Tell the community a little about yourself"
                          />
                        </div>
                      </form>
                      <DialogFooter className="gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" form="edit-profile-form" disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
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
              posts.map((postItem) => <PostCard key={postItem.id} post={postItem} />)
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
    );
  }, [loading, profileData, stats, posts, isOwnProfile, isEditOpen, formState, saving, handleEditSubmit, primaryBadge]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">{content}</main>
      </div>
    </div>
  );
}
