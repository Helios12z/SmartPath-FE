import { fetchWrapper } from '@/lib/fetchWrapper';
import type { Chat, ChatCreatePayload } from '../types';

export const chatAPI = {
  getAll: async (): Promise<Chat[]> => fetchWrapper.get('/chat'),
  getById: async (id: string): Promise<Chat> => fetchWrapper.get(`/chat/${id}`),
  create: async (payload: ChatCreatePayload): Promise<Chat> => fetchWrapper.post('/chat', payload),
  delete: async (id: string): Promise<void> => fetchWrapper.del(`/chat/${id}`),

  getMine: async (): Promise<Chat[]> => fetchWrapper.get('/chat/mine'),

  getOrCreateDirect: async (otherUserId: string): Promise<Chat> =>
    fetchWrapper.post(`/chat/direct/${otherUserId}`, {}),
};
