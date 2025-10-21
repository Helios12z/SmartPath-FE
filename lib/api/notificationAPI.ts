import { fetchWrapper } from '@/lib/fetchWrapper';
import { Notification } from '../types';

export const notificationAPI = {
  mine: async (): Promise<Notification[]> => fetchWrapper.get('/notification/mine'),
  unreadCount: async (): Promise<number> =>
    fetchWrapper.get('/notification/mine/unread-count'),
  markRead: async (id: string): Promise<void> =>
    fetchWrapper.put(`/notification/${id}/read`, {}),
};
