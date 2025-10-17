'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserCheck, X, Users } from 'lucide-react';
import { mockFriendships, mockUsers, currentUser } from '@/lib/mockData';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function FriendsPage() {
  const { toast } = useToast();
  const [localFriendships, setLocalFriendships] = useState(mockFriendships);

  const friendsList = localFriendships
    .filter(f =>
      (f.follower_id === currentUser.id || f.followed_user_id === currentUser.id) &&
      f.status === 'accepted'
    )
    .map(f => {
      const friendId = f.follower_id === currentUser.id ? f.followed_user_id : f.follower_id;
      return mockUsers.find(u => u.id === friendId);
    })
    .filter(Boolean);

  const pendingRequests = localFriendships
    .filter(f => f.followed_user_id === currentUser.id && f.status === 'pending')
    .map(f => {
      const requester = mockUsers.find(u => u.id === f.follower_id);
      return { ...f, requester };
    });

  const suggestedFriends = mockUsers.filter(
    u => u.id !== currentUser.id &&
    !localFriendships.some(f =>
      (f.follower_id === currentUser.id && f.followed_user_id === u.id) ||
      (f.followed_user_id === currentUser.id && f.follower_id === u.id)
    )
  );

  const handleAcceptRequest = (requestId: string) => {
    setLocalFriendships(prev =>
      prev.map(f => f.id === requestId ? { ...f, status: 'accepted' as const } : f)
    );
    toast({ title: 'Success', description: 'Friend request accepted' });
  };

  const handleRejectRequest = (requestId: string) => {
    setLocalFriendships(prev =>
      prev.map(f => f.id === requestId ? { ...f, status: 'rejected' as const } : f)
    );
    toast({ title: 'Success', description: 'Friend request rejected' });
  };

  const handleSendRequest = (userId: string) => {
    const newRequest = {
      id: `friend${Date.now()}`,
      follower_id: currentUser.id,
      followed_user_id: userId,
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };
    setLocalFriendships(prev => [...prev, newRequest]);
    toast({ title: 'Success', description: 'Friend request sent' });
  };

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
                  All Friends ({friendsList.length})
                </TabsTrigger>
                <TabsTrigger value="requests">
                  Requests ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {friendsList.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No friends yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friendsList.map((friend) => (
                      <Card key={friend?.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={friend?.avatar_url} alt={friend?.full_name} />
                              <AvatarFallback>{friend?.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/profile/${friend?.id}`}
                                className="font-medium hover:underline"
                              >
                                {friend?.full_name}
                              </Link>
                              <p className="text-sm text-muted-foreground">{friend?.major}</p>
                              <Badge variant="secondary" className="mt-1">{friend?.point} pts</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4 mt-6">
                {pendingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No pending requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={request.requester?.avatar_url} alt={request.requester?.full_name} />
                                <AvatarFallback>{request.requester?.full_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.requester?.full_name}</div>
                                <div className="text-sm text-muted-foreground">{request.requester?.major}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(request.id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedFriends.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={user.avatar_url} alt={user.full_name} />
                            <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/profile/${user.id}`}
                              className="font-medium hover:underline"
                            >
                              {user.full_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{user.major}</p>
                            <Badge variant="secondary" className="mt-1">{user.point} pts</Badge>
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleSendRequest(user.id)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Friend
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
