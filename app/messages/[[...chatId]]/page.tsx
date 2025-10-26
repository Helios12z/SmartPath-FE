'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { chatAPI } from '@/lib/api/chatAPI';
import type { Chat, Message } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function MessagesPage() {
  const params = useParams<{ chatId?: string[] }>();
  const router = useRouter();
  const { profile: currentUser } = useAuth();

  // Lấy chatId từ URL (nếu có)
  const chatIdFromUrl = Array.isArray(params.chatId) ? params.chatId[0] : undefined;

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(chatIdFromUrl);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Tải danh sách chat của mình
  useEffect(() => {
    (async () => {
      try {
        const mine = await chatAPI.getMine();
        setChats(mine);

        // Nếu URL không có chatId, tự điều hướng sang chat đầu tiên (nếu có)
        if (!chatIdFromUrl && mine.length > 0) {
          setSelectedChatId(mine[0].id);
          router.replace(`/messages/${mine[0].id}`);
        } else {
          // Nếu URL có chatId, đồng bộ state chọn
          setSelectedChatId(chatIdFromUrl);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [chatIdFromUrl, router]);

  // Tải chi tiết chat khi selectedChatId thay đổi
  useEffect(() => {
    if (!selectedChatId) {
      setSelectedChat(null);
      return;
    }
    (async () => {
      try {
        const chat = await chatAPI.getById(selectedChatId);
        setSelectedChat(chat);
      } catch (e) {
        console.error(e);
        setSelectedChat(null);
      }
    })();
  }, [selectedChatId]);

  const handleSelectChat = useCallback((id: string) => {
    setSelectedChatId(id);
    router.push(`/messages/${id}`);
  }, [router]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChatId) return;

    // Tạm mock append local (chưa realtime / API send)
    const newMsg: Message = {
      id: crypto.randomUUID(),
      content: messageInput.trim(),
      senderId: currentUser?.id ?? 'me',
      senderUsername: currentUser?.username ?? 'me',
      isRead: false,
      createdAt: new Date().toISOString(),
    } as any;

    setSelectedChat(prev => {
      if (!prev) return prev;
      return { ...prev, messages: [...(prev.messages ?? []), newMsg] } as Chat;
    });

    setMessageInput('');
  };

  const otherMember = useMemo(() => {
    // (Tuỳ bạn mở rộng ChatResponseDto để có members/otherUser)
    return null;
  }, [selectedChat]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Chat with friends and groups</p>
            </div>

            <div className="grid grid-cols-12 gap-4 h-[600px]">
              {/* Sidebar chats */}
              <Card className="col-span-4">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {loading ? (
                      <div className="text-sm text-muted-foreground p-3">Loading...</div>
                    ) : chats.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-3">No chats</div>
                    ) : (
                      chats.map((chat) => {
                        const title = chat.otherUser?.fullName ?? chat.name ?? 'Direct Chat';
                        const avatarUrl = chat.otherUser?.avatarUrl ?? undefined;
                        const avatarFallback = (chat.otherUser?.fullName?.[0] ?? 'D').toUpperCase();
                        const lastMessage = (chat.messages ?? [])
                          .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                        return (
                          <button
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={`w-full p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-left ${selectedChatId === chat.id ? 'bg-slate-100 dark:bg-slate-900' : ''
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={avatarUrl} alt={title} />
                                <AvatarFallback>{avatarFallback}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{title}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {lastMessage?.content || 'No messages yet'}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Main pane */}
              <Card className="col-span-8 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={''} alt={'Direct'} />
                        <AvatarFallback>D</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedChat.name ?? 'Direct Chat'}</div>
                        <div className="text-sm text-muted-foreground">
                          {/* otherMember info nếu có */}
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {(selectedChat.messages ?? []).map((message) => {
                          const isOwn = message.senderId === currentUser?.id;
                          return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={''} alt={message.senderUsername} />
                                  <AvatarFallback>{message.senderUsername?.charAt(0) ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className={`rounded-lg p-3 ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}>
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  <div className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : ''}`}>
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Select a chat to start messaging</p>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}