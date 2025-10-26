import { fetchWrapper } from '@/lib/fetchWrapper';
import type {
  BotConversationCreateRequest,
  BotConversationResponse,
  BotConversationWithMessagesResponse,
  BotMessageRequest,
  BotMessageResponse,
  PageResult,
  RenameConversationRequest,
} from '@/lib/types';

export const botAPI = {
  // Conversations
  createConversation: async (
    payload: BotConversationCreateRequest
  ): Promise<BotConversationResponse> =>
    fetchWrapper.post('/bot/conversations', payload),

  mineConversations: async (
    page = 1,
    pageSize = 20
  ): Promise<PageResult<BotConversationResponse>> =>
    fetchWrapper.get(`/bot/conversations?page=${page}&pageSize=${pageSize}`),

  getConversationWithMessages: async (
    conversationId: string,
    limit = 50,
    beforeMessageId?: string
  ): Promise<BotConversationWithMessagesResponse> => {
    const qs = new URLSearchParams();
    qs.set('limit', String(limit));
    if (beforeMessageId) qs.set('beforeMessageId', beforeMessageId);
    return fetchWrapper.get(`/bot/conversations/${conversationId}?${qs.toString()}`);
  },

  renameConversation: async (
    conversationId: string,
    payload: RenameConversationRequest
  ): Promise<void> =>
    fetchWrapper.patch(`/bot/conversations/${conversationId}/title`, payload),

  deleteConversation: async (conversationId: string): Promise<void> =>
    fetchWrapper.del(`/bot/conversations/${conversationId}`),

  // Messages
  appendMessage: async (payload: BotMessageRequest): Promise<BotMessageResponse> =>
    fetchWrapper.post('/bot/messages', payload),

  listMessages: async (
    conversationId: string,
    limit = 50,
    beforeMessageId?: string
  ): Promise<BotMessageResponse[]> => {
    const qs = new URLSearchParams();
    qs.set('limit', String(limit));
    if (beforeMessageId) qs.set('beforeMessageId', beforeMessageId);
    return fetchWrapper.get(`/bot/conversations/${conversationId}/messages?${qs.toString()}`);
  },

  deleteMessage: async (messageId: string): Promise<void> =>
    fetchWrapper.del(`/bot/messages/${messageId}`),

  appendUserThenAssistant: async (
    conversationId: string,
    userContent: string,
    assistantContent: string,
    tokenStats?: { promptTokens?: number; completionTokens?: number; totalTokens?: number; latencyMs?: number },
    toolCallsJson?: string
  ): Promise<{ user: BotMessageResponse; assistant: BotMessageResponse }> => {
    const user = await fetchWrapper.post('/bot/messages', {
      conversationId,
      content: userContent,
      role: 1, // BotMessageRole.User
      ...tokenStats,
      toolCallsJson,
    } as BotMessageRequest);

    const assistant = await fetchWrapper.post('/bot/messages', {
      conversationId,
      content: assistantContent,
      role: 2, // BotMessageRole.Assistant
      ...tokenStats,
      toolCallsJson,
    } as BotMessageRequest);

    return { user, assistant };
  },
};
