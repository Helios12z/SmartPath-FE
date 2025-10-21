import { fetchWrapper } from '@/lib/fetchWrapper';
import type { Comment, CommentRequestDto } from '@/lib/types';

export const commentAPI = {
  getByPost: async (postId: string): Promise<Comment[]> =>
    fetchWrapper.get(`/comment/by-post/${postId}`),

  create: async (payload: CommentRequestDto): Promise<Comment> =>
    fetchWrapper.post('/comment', payload),

  update: async (id: string, payload: Partial<CommentRequestDto>): Promise<Comment> =>
    fetchWrapper.put(`/comment/${id}`, payload),

  delete: async (id: string): Promise<void> => fetchWrapper.del(`/comment/${id}`),
};
