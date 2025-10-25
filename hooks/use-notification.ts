'use client';

import { useCallback, useEffect, useState } from 'react';
import { notificationAPI } from '@/lib/api/notificationAPI';
import type { Notification } from '@/lib/types';

export function useNotifications(pollMs = 20000) {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [list, count] = await Promise.all([
        notificationAPI.mine(),
        notificationAPI.unreadCount(),
      ]);
      setItems(list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
      setUnread(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, pollMs);
    return () => clearInterval(t);
  }, [refresh, pollMs]);

  const markRead = useCallback(async (id: string) => {
    await notificationAPI.markRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } as Notification : n))
    );
    setUnread((u) => Math.max(0, u - 1));
  }, []);

  const removeLocal = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { items, unread, loading, refresh, markRead, removeLocal, setItems };
}