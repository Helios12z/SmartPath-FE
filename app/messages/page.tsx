'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { mockChats, mockMessages, mockUsers, currentUser, getChatWithMessages } from '@/lib/mockData';

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>(mockChats[0]?.id);
  const [messageInput, setMessageInput] = useState('');

  const selectedChat = selectedChatId ? getChatWithMessages(selectedChatId) : null;
  const otherMember = selectedChat ?
    (selectedChat.member1?.id === currentUser.id ? selectedChat.member2 : selectedChat.member1) : null;

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    console.log('Message sent (mock):', messageInput);
    setMessageInput('');
  };

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
              <Card className="col-span-4">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {mockChats.map((chat) => {
                      const otherUser = chat.member_1_id === currentUser.id
                        ? mockUsers.find(u => u.id === chat.member_2_id)
                        : mockUsers.find(u => u.id === chat.member_1_id);

                      const lastMessage = mockMessages
                        .filter(m => m.chat_id === chat.id)
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                      return (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`w-full p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-left ${
                            selectedChatId === chat.id ? 'bg-slate-100 dark:bg-slate-900' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={otherUser?.avatar_url} alt={otherUser?.full_name} />
                              <AvatarFallback>{otherUser?.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{otherUser?.full_name}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {lastMessage?.content || 'No messages yet'}
                              </div>
                            </div>
                            {lastMessage && !lastMessage.is_read && lastMessage.sender_id !== currentUser.id && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="col-span-8 flex flex-col">
                {selectedChat && otherMember ? (
                  <>
                    <div className="p-4 border-b flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={otherMember.avatar_url} alt={otherMember.full_name} />
                        <AvatarFallback>{otherMember.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{otherMember.full_name}</div>
                        <div className="text-sm text-muted-foreground">{otherMember.major}</div>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {selectedChat.messages.map((message) => {
                          const isOwn = message.sender_id === currentUser.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.sender?.avatar_url} alt={message.sender?.full_name} />
                                  <AvatarFallback>{message.sender?.full_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div
                                    className={`rounded-lg p-3 ${
                                      isOwn
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-900'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  <div className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : ''}`}>
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
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
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
