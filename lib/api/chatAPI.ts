import { fetchWrapper } from '@/lib/fetchWrapper';
import { Chat, ChatRequestDto } from '../types';

export const chatAPI = {
  getAll: async (): Promise<Chat[]> => fetchWrapper.get('/chat'),
  getById: async (id: string): Promise<Chat> => fetchWrapper.get(`/chat/${id}`),
  create: async (payload: ChatRequestDto): Promise<Chat> =>
    fetchWrapper.post('/chat', payload),
  delete: async (id: string): Promise<void> => fetchWrapper.del(`/chat/${id}`),
};
