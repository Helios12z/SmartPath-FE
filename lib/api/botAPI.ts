import { fetchWrapper } from '@/lib/fetchWrapper';
import type {
  BotConversationCreateRequest,
  BotConversationResponse,
  BotConversationWithMessagesResponse,
  BotMessageRequest,
  BotMessageResponse,
  PageResult,
  RenameConversationRequest,
  BotGenerateResponse
} from '@/lib/types';
import { BotMessageRole } from '@/lib/types';

export const botAPI = {
  createConversation: async (
    payload: BotConversationCreateRequest
  ): Promise<BotConversationResponse> =>
    fetchWrapper.post<BotConversationResponse>('/bot/conversations', payload),

  mineConversations: async (
    page = 1,
    pageSize = 20
  ): Promise<PageResult<BotConversationResponse>> =>
    fetchWrapper.get<PageResult<BotConversationResponse>>(`/bot/conversations?page=${page}&pageSize=${pageSize}`),

  getConversationWithMessages: async (
    conversationId: string,
    limit = 50,
    beforeMessageId?: string
  ): Promise<BotConversationWithMessagesResponse> => {
    const qs = new URLSearchParams();
    qs.set('limit', String(limit));
    if (beforeMessageId) qs.set('beforeMessageId', beforeMessageId);
    return fetchWrapper.get<BotConversationWithMessagesResponse>(`/bot/conversations/${conversationId}?${qs.toString()}`);
  },

  renameConversation: async (
    conversationId: string,
    payload: RenameConversationRequest
  ): Promise<void> =>
    fetchWrapper.patch<void>(`/bot/conversations/${conversationId}/title`, payload),

  deleteConversation: async (conversationId: string): Promise<void> =>
    fetchWrapper.del<void>(`/bot/conversations/${conversationId}`),

  appendMessage: async (payload: BotMessageRequest): Promise<BotMessageResponse> =>
    fetchWrapper.post<BotMessageResponse>('/bot/messages', payload),

  listMessages: async (
    conversationId: string,
    limit = 50,
    beforeMessageId?: string
  ): Promise<BotMessageResponse[]> => {
    const qs = new URLSearchParams();
    qs.set('limit', String(limit));
    if (beforeMessageId) qs.set('beforeMessageId', beforeMessageId);
    return fetchWrapper.get<BotMessageResponse[]>(`/bot/conversations/${conversationId}/messages?${qs.toString()}`);
  },

  deleteMessage: async (messageId: string): Promise<void> =>
    fetchWrapper.del<void>(`/bot/messages/${messageId}`),

  appendUserThenAssistant: async (
    conversationId: string,
    userContent: string,
    assistantContent: string,
    tokenStats?: { promptTokens?: number; completionTokens?: number; totalTokens?: number; latencyMs?: number },
    toolCallsJson?: string
  ): Promise<{ user: BotMessageResponse; assistant: BotMessageResponse }> => {
    const user = await fetchWrapper.post<BotMessageResponse>('/bot/messages', {
      conversationId,
      content: userContent,
      role: BotMessageRole.User,
      ...tokenStats,
      toolCallsJson,
    } as BotMessageRequest);

    const assistant = await fetchWrapper.post<BotMessageResponse>('/bot/messages', {
      conversationId,
      content: assistantContent,
      role: BotMessageRole.Assistant,
      ...tokenStats,
      toolCallsJson,
    } as BotMessageRequest);

    return { user, assistant };
  },

  generate: async (payload: {
    conversationId: string;
    userContent: string;
    systemPrompt?: string | null;
    contextLimit?: number;
    model?: string;
  }): Promise<BotGenerateResponse> =>
    fetchWrapper.post<BotGenerateResponse>('/bot/generate', payload),
};
