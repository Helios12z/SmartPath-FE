import { fetchWrapper } from '@/lib/fetchWrapper';
import { Message, MessageRequestDto } from '../types';

export const messageAPI = {
  getByChat: async (chatId: string): Promise<Message[]> =>
    fetchWrapper.get(`/message/by-chat/${chatId}`),

  send: async (payload: MessageRequestDto): Promise<Message> =>
    fetchWrapper.post('/message', payload),

  markRead: async (messageId: string): Promise<void> =>
    fetchWrapper.put(`/message/${messageId}/read`, {}),
};
