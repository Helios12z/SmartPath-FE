'use client';
import * as signalR from '@microsoft/signalr';

type NewMessageEvent = {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderUsername: string;
  isRead: boolean;
  createdAt: string;
};

type MessageReadEvent = {
  messageId: string;
  chatId: string;
  readerId: string;
};

const g = globalThis as unknown as {
  __chatConn?: signalR.HubConnection;
  __chatStarted?: boolean;
  __chatHandlersSet?: boolean;
};

export function getHubConnection(hubUrl: string, tokenGetter: () => string | null) {
  if (!g.__chatConn) {
    g.__chatConn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => tokenGetter() ?? '',
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: ctx => (ctx.previousRetryCount < 5 ? 1000 * (ctx.previousRetryCount + 1) : 5000),
      })
      .build();

    g.__chatConn.onclose(err => console.error('[SignalR] closed', err));
    g.__chatConn.onreconnecting(err => console.warn('[SignalR] reconnecting', err));
    g.__chatConn.onreconnected(id => console.log('[SignalR] reconnected', id));
  }
  return g.__chatConn!;
}

export async function ensureStarted(conn: signalR.HubConnection) {
  if (!g.__chatStarted) {
    await conn.start();
    g.__chatStarted = true;
    console.log('[SignalR] started');
  }
}

export function setHandlersOnce(
  conn: signalR.HubConnection,
  handlers: {
    onNewMessage?: (m: NewMessageEvent) => void;
    onMessageRead?: (e: MessageReadEvent) => void;
  }
) {
  if (g.__chatHandlersSet) return;
  if (handlers.onNewMessage) conn.on('NewMessage', handlers.onNewMessage);
  if (handlers.onMessageRead) conn.on('MessageRead', handlers.onMessageRead);
  g.__chatHandlersSet = true;
}

export function stopOnUnload(conn: signalR.HubConnection) {
  if (typeof window === 'undefined') return;
  const handler = () => conn.stop().catch(() => {});
  window.addEventListener('beforeunload', handler, { once: true });
}