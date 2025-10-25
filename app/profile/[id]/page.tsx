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
import type { UserProfile, BadgeAward } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UserBadge } from '@/components/badges/UserBadge';
import { userAPI } from '@/lib/api/userAPI';
import AvatarCropDialog from '@/components/profile/AvatarCropDialog';

type ProfileStats = {
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
};

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { profile: currentUser } = useAuth();
  const { toast } = useToast();

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [primaryBadge, setPrimaryBadge] = useState<BadgeAward | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    email: '',
    username: '',
    full_name: '',
    phone_number: '',
    avatar_url: '',
    field_of_study: '',
    faculty: '',
    year_of_study: '',
    bio: '',
  });

  const isOwnProfile = currentUser?.id === profileId;

  const loadProfile = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const u = await userAPI.getById(profileId);
      setProfileData(u);

      const pb =
        (u as any).primaryBadge ??
        (u as any).primary_badge ??
        ((u as any).badges?.length ? (u as any).badges[0] : null);
      setPrimaryBadge(pb ?? null);

      setPosts([]); // cắm postAPI khi sẵn sàng

      setStats({
        postsCount: 0,
        commentsCount: 0,
        likesReceived: 0,
      });
    } catch (e) {
      console.error('Failed to load profile', e);
      setProfileData(null);
      setPrimaryBadge(null);
      setPosts([]);
      setStats({ postsCount: 0, commentsCount: 0, likesReceived: 0 });
      toast({
        title: 'Không tải được hồ sơ',
        description: 'Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profileId, toast]);

  useEffect(() => {
    if (!profileId) return;
    loadProfile();
  }, [profileId, loadProfile]);

  useEffect(() => {
    if (!isEditOpen || !profileData) return;
    setFormState({
      email: profileData.email ?? '',
      username: profileData.username ?? '',
      full_name: profileData.fullName ?? '',
      phone_number: profileData.phoneNumber ?? '',
      avatar_url: profileData.avatarUrl ?? '',
      field_of_study:
        (profileData as any).field_of_study ??
        (profileData as any).major ??
        '',
      faculty: (profileData as any).faculty ?? '',
      year_of_study:
        (profileData as any).yearOfStudy != null
          ? String((profileData as any).yearOfStudy)
          : '',
      bio: profileData.bio ?? '',
    });
  }, [isEditOpen, profileData]);

  const prune = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const out: Partial<T> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue;
      if (typeof v === 'string') {
        const t = v.trim();
        if (!t) continue;
        (out as any)[k] = t;
      } else {
        (out as any)[k] = v;
      }
    }
    return out;
  };

  const handleEditSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!profileData) return;

      setSaving(true);
      try {
        const raw = {
          email: formState.email || profileData.email,
          username: formState.username?.trim() || profileData.username,

          fullName: formState.full_name,
          phoneNumber: formState.phone_number,
          avatarUrl: formState.avatar_url,
          major: formState.field_of_study,
          faculty: formState.faculty,
          yearOfStudy:
            formState.year_of_study.trim() === ''
              ? undefined
              : Number(formState.year_of_study),
          bio: formState.bio,
        };
        const payload = prune(raw);
        const updated = await userAPI.update(profileId, payload);

        setProfileData(updated);
        setIsEditOpen(false);
        toast({
          title: 'Đã cập nhật hồ sơ',
          description: 'Thông tin của bạn đã được lưu.',
        });
      } catch (error) {
        console.error('Failed to update profile', error);
        toast({
          title: 'Cập nhật thất bại',
          description: 'Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau.',
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [formState, profileData, profileId, toast]
  );

  const handleAvatarUploaded = useCallback(
    async (fileUrl: string) => {
      if (!profileId) return;
      try {
        let email = profileData?.email;
        let username = profileData?.username;

        if (!email || !username) {
          const u = await userAPI.getById(profileId);
          email = u.email;
          username = u.username;
        }

        const payload = {
          email,          
          username,       
          avatarUrl: fileUrl, 
        };

        const updated = await userAPI.update(profileId, payload);
        setProfileData(updated);
        setProfileData((p) => p ? ({ ...p, avatarUrl: `${fileUrl}?v=${Date.now()}` }) : p);

        toast({ title: 'Ảnh đại diện đã được cập nhật' });
        setAvatarDialogOpen(false);
      } catch (e) {
        console.error(e);
        toast({
          title: 'Cập nhật avatar thất bại',
          description: 'Upload thành công nhưng cập nhật hồ sơ bị lỗi. Hãy thử lại.',
          variant: 'destructive',
        });
      }
    },
    [profileId, profileData, toast]
  );


  const content = useMemo(() => {
    if (loading) {
      return (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
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
              {/* Cột trái: Avatar + nút overlay */}
              <div className="relative w-24">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.avatarUrl ?? undefined} alt={profileData.fullName ?? "Avatar"} />
                  <AvatarFallback className="text-2xl">
                    {profileData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setAvatarDialogOpen(true)}
                    aria-label="Change avatar">
                  </button>
                )}
              </div>

              {/* Cột phải: Thông tin + action buttons */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  {primaryBadge && (
                    <div>
                      <UserBadge badge={primaryBadge} size="md" />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold">{profileData.fullName}</h1>
                  <p className="text-muted-foreground">{profileData.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>{profileData.role}</Badge>
                  <Badge variant="outline">
                    <Award className="mr-1 h-3 w-3" />
                    {profileData.point ?? 0} reputation
                  </Badge>
                  {(profileData as any).field_of_study || (profileData as any).major ? (
                    <Badge variant="secondary">
                      {(profileData as any).field_of_study || (profileData as any).major}
                    </Badge>
                  ) : null}
                </div>

                {profileData.bio && (
                  <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                )}

                {/* Hàng nút hành động rõ ràng hơn */}
                <div className="flex flex-wrap gap-2">
                  {isOwnProfile ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setAvatarDialogOpen(true)}>
                        Change Avatar
                      </Button>

                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                              Update your avatar and personal information.
                            </DialogDescription>
                          </DialogHeader>

                          <form id="edit-profile-form" className="space-y-4" onSubmit={handleEditSubmit}>
                            {/* Email (read-only để gửi kèm cho BE) */}
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                value={formState.email}
                                disabled
                                readOnly
                              />
                            </div>

                            {/* Username (có thể cho sửa hoặc không tuỳ chính sách) */}
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <Input
                                id="username"
                                value={formState.username}
                                onChange={(e) => setFormState((p) => ({ ...p, username: e.target.value }))}
                                disabled={saving}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="full_name">Full Name</Label>
                              <Input
                                id="full_name"
                                value={formState.full_name}
                                onChange={(e) => setFormState((p) => ({ ...p, full_name: e.target.value }))}
                                disabled={saving}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="phone_number">Phone Number</Label>
                              <Input
                                id="phone_number"
                                value={formState.phone_number}
                                onChange={(e) => setFormState((p) => ({ ...p, phone_number: e.target.value }))}
                                disabled={saving}
                                placeholder="+1234567890"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="avatar_url">Avatar URL</Label>
                              <Input
                                id="avatar_url"
                                value={formState.avatar_url}
                                onChange={(e) => setFormState((p) => ({ ...p, avatar_url: e.target.value }))}
                                disabled={saving}
                                placeholder="https://example.com/avatar.jpg"
                              />
                            </div>

                            {/* Major (BE) – bạn đang gọi là field_of_study trên FE */}
                            <div className="space-y-2">
                              <Label htmlFor="field_of_study">Major</Label>
                              <Input
                                id="field_of_study"
                                value={formState.field_of_study}
                                onChange={(e) => setFormState((p) => ({ ...p, field_of_study: e.target.value }))}
                                disabled={saving}
                                placeholder="e.g. Computer Science"
                              />
                            </div>

                            {/* Faculty (NEW) */}
                            <div className="space-y-2">
                              <Label htmlFor="faculty">Faculty</Label>
                              <Input
                                id="faculty"
                                value={formState.faculty}
                                onChange={(e) => setFormState((p) => ({ ...p, faculty: e.target.value }))}
                                disabled={saving}
                                placeholder="e.g. Engineering"
                              />
                            </div>

                            {/* Year of Study (NEW) */}
                            <div className="space-y-2">
                              <Label htmlFor="year_of_study">Year of Study</Label>
                              <Input
                                id="year_of_study"
                                type="number"
                                min={1}
                                max={20}
                                value={formState.year_of_study}
                                onChange={(e) => setFormState((p) => ({ ...p, year_of_study: e.target.value }))}
                                disabled={saving}
                                placeholder="e.g. 3"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea
                                id="bio"
                                value={formState.bio}
                                onChange={(e) => setFormState((p) => ({ ...p, bio: e.target.value }))}
                                disabled={saving}
                                rows={4}
                                placeholder="Tell the community a little about yourself"
                              />
                            </div>
                          </form>

                          <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving}>
                              Cancel
                            </Button>
                            <Button type="submit" form="edit-profile-form" disabled={saving}>
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <>
                      <Button size="sm">
                        <Users className="mr-2 h-4 w-4" />
                        Add Friend
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
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
                <p className="text-muted-foreground">
                  No posts yet {/* hoặc nạp posts bằng postAPI khi sẵn sàng */}
                </p>
              </Card>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
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

      <AvatarCropDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        onUploaded={handleAvatarUploaded}
      />
    </div>
  );
}