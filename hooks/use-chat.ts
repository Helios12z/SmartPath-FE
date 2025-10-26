'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getHubConnection, ensureStarted, setHandlersOnce, stopOnUnload } from '@/lib/signalrClient';
import { useAccessToken } from './use-access-token';

export function useChatHub(opts?: {
  hubUrl?: string;
  onNewMessage?: (m: any) => void;
  onMessageRead?: (e: any) => void;
  selectedChatId?: string | undefined; 
}) {
  const { hubUrl = process.env.NEXT_PUBLIC_HUB_URL ?? '', onNewMessage, onMessageRead, selectedChatId } = opts || {};
  const { tokenRef } = useAccessToken();
  const [connected, setConnected] = useState(false);
  const connRef = useRef<ReturnType<typeof getHubConnection> | null>(null);
  const currentChatRef = useRef<string | undefined>(undefined);

  const tokenGetter = useCallback(() => tokenRef.current, [tokenRef]);

  useEffect(() => {
    if (!hubUrl) return;
    const conn = getHubConnection(hubUrl, tokenGetter);
    connRef.current = conn;

    setHandlersOnce(conn, { onNewMessage, onMessageRead });

    ensureStarted(conn)
      .then(() => {
        setConnected(true);
        stopOnUnload(conn);
        if (currentChatRef.current) {
          conn.invoke('JoinChat', currentChatRef.current).catch(console.error);
        }
      })
      .catch(err => console.error('[SignalR] start failed', err));

    return () => {};
  }, [hubUrl, tokenGetter, onNewMessage, onMessageRead]);

  useEffect(() => {
    if (!connRef.current) return;
    const conn = connRef.current;
    const prev = currentChatRef.current;
    const next = selectedChatId;
    (async () => {
      try {
        if (prev && prev !== next) {
          await conn.invoke('LeaveChat', prev);
        }
        if (next) {
          await conn.invoke('JoinChat', next);
        }
        currentChatRef.current = next;
      } catch (e) {
        console.error('Join/Leave failed', e);
      }
    })();
  }, [selectedChatId]);

  const join = useCallback(async (chatId: string) => {
    if (!connRef.current) return;
    await connRef.current.invoke('JoinChat', chatId);
    currentChatRef.current = chatId;
  }, []);

  const leave = useCallback(async (chatId: string) => {
    if (!connRef.current) return;
    await connRef.current.invoke('LeaveChat', chatId);
    if (currentChatRef.current === chatId) currentChatRef.current = undefined;
  }, []);

  return { connected, join, leave };
}
