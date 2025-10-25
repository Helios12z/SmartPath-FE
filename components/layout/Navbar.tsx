'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Moon,
  Sun,
  Search,
  Menu,
  GraduationCap,
  LogOut,
  User,
  Settings,
  Clock,
  Check,
  Trash2,
  ExternalLink,
  Eraser
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

import { useNotifications } from '@/hooks/use-notification';
import { notificationAPI } from '@/lib/api/notificationAPI';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
      toast({ title: 'Signed out', description: 'You have been successfully signed out' });
      router.push('/auth/login');
    } catch {
      toast({ title: 'Error', description: 'Failed to sign out', variant: 'destructive' });
    }
  };

  const navLinks = [
    { href: '/forum', label: 'Forum' },
    { href: '/materials', label: 'Materials' },
    { href: '/friends', label: 'Friends' },
  ];

  const { items, unread, loading, markRead, removeLocal, refresh } = useNotifications(20000);

  const handleOpen = async (n: any) => {
    try {
      if (!n.isRead) await markRead(n.id);

      const url = buildForumUrlFromNotification(n);
      if (url) {
        router.push(url);
        return;
      }

      router.push('/forum');
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Cannot open notification', variant: 'destructive' });
    }
  };

  function buildForumUrlFromNotification(n: any): string | null {
    if (typeof n?.url === 'string' && n.url.trim().length > 0) {
      const raw = n.url.trim();

      let path = raw;
      try {
        const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://dummy.local');
        path = u.pathname + u.search;
      } catch {
        //nothing need to be done 
      }

      const m = path.match(/^\/(posts|forum)\/([^/?#]+)(\?[^#]*)?$/i);
      if (m) {
        const postId = m[2];
        const qs = new URLSearchParams((m[3] ?? '').replace(/^\?/, ''));
        const c = qs.get('c');
        return `/forum/${postId}${c ? `?c=${encodeURIComponent(c)}` : ''}`;
      }
    }

    const postId = n?.postId ?? n?.PostId ?? n?.post_id;
    const commentId = n?.commentId ?? n?.CommentId ?? n?.comment_id;

    if (typeof postId === 'string' && postId.length > 0) {
      return `/forum/${postId}${commentId ? `?c=${encodeURIComponent(commentId)}` : ''}`;
    }

    // 3) Tùy theo type có thể suy luận postId (nếu bạn muốn mở rộng thêm ở đây)

    return null;
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.remove(id);
      removeLocal(id);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const handleClearRead = async () => {
    try {
      const res = await notificationAPI.clearReadMine();
      toast({
        title: 'Cleared',
        description: `Đã xóa ${res.deleted} thông báo đã đọc`,
      });
      refresh();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to clear read notifications', variant: 'destructive' });
    }
  };

  // Chuẩn hoá role & point
  const roleRaw = (profile as any)?.role ?? 'Student';
  const roleLabel = typeof roleRaw === 'string' ? roleRaw : String(roleRaw);
  const isAdmin = roleLabel.toLowerCase() === 'admin';
  const points = (profile as any)?.point ?? 0;

  const rawAvatar =
    (profile as any)?.avatarUrl ??
    (profile as any)?.avatar_url ??
    undefined;

  const avatarVersion =
    (profile as any)?.updatedAt ??
    (profile as any)?.avatarUpdatedAt ??
    '';

  const avatarSrc = useMemo(() => {
    if (!rawAvatar) return undefined;
    return avatarVersion ? `${rawAvatar}?v=${encodeURIComponent(avatarVersion)}` : rawAvatar;
  }, [rawAvatar, avatarVersion]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand + nav links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:inline-block">SmartPath</span>
            </Link>

            {profile && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={pathname?.startsWith(link.href) ? 'secondary' : 'ghost'}
                      size="sm"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {profile ? (
              <>
                {/* Search */}
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                  <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unread > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center p-0 text-[11px]">
                          {unread > 99 ? '99+' : unread}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-96 p-0">
                    <div className="flex items-center justify-between px-3 py-2">
                      <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={refresh}>
                          <ExternalLink className="h-4 w-4 mr-1" /> Refresh
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleClearRead} title="Clear read">
                          <Eraser className="h-4 w-4 mr-1" /> Clear read
                        </Button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {loading ? (
                      <div className="p-4 text-sm text-muted-foreground">Đang tải...</div>
                    ) : items.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Không có thông báo
                      </div>
                    ) : (
                      <div className="max-h-[360px] overflow-auto">
                        {items.map((n) => (
                          <div
                            key={n.id}
                            className={`px-3 py-2 text-sm hover:bg-accent/60 flex items-start gap-2 ${n.isRead ? 'opacity-70' : ''}`}
                          >
                            {/* Dot trạng thái */}
                            <div className={`mt-1 h-2 w-2 rounded-full ${n.isRead ? 'bg-muted' : 'bg-blue-500'}`} />

                            {/* Nội dung */}
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => handleOpen(n)}
                                className="text-left w-full"
                                title="Open"
                              >
                                <div className="font-medium line-clamp-2">{n.content}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                              </button>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0 flex items-center gap-1">
                              {!n.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Đánh dấu đã đọc"
                                  onClick={() => markRead(n.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Xóa thông báo"
                                onClick={() => handleDelete(n.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme switch */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                </Button>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarSrc} alt={profile?.fullName ?? 'Avatar'} />
                        <AvatarFallback>
                          {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{profile?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {roleLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{points} pts</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${profile?.id}`} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu icon */}
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                {/* Theme switch (when logged out) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                </Button>

                {/* Auth buttons */}
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}