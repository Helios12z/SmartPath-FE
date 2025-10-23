import { fetchWrapper } from '@/lib/fetchWrapper';
import type { CommentResponseDto, CommentRequestDto } from '@/lib/types';

export const commentAPI = {
  getByPost: async (postId: string): Promise<CommentResponseDto[]> =>
    fetchWrapper.get(`/comment/by-post/${postId}`),

  create: async (payload: CommentRequestDto): Promise<CommentResponseDto> =>
    fetchWrapper.post('/comment', payload),

  update: async (id: string, payload: Partial<CommentRequestDto>): Promise<CommentResponseDto> =>
    fetchWrapper.put(`/comment/${id}`, payload),

  delete: async (id: string): Promise<void> => fetchWrapper.del(`/comment/${id}`),
};
