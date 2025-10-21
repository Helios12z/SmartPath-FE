import { fetchWrapper } from '@/lib/fetchWrapper';
import type { ForumPost, PostRequestDto } from '@/lib/types';

export const postAPI = {
  getAll: async (): Promise<ForumPost[]> => fetchWrapper.get('/post'),

  getById: async (id: string): Promise<ForumPost> => fetchWrapper.get(`/post/${id}`),

  getByUser: async (userId: string): Promise<ForumPost[]> =>
    fetchWrapper.get(`/post/by-user/${userId}`),

  create: async (payload: PostRequestDto): Promise<ForumPost> =>
    fetchWrapper.post('/post', payload),

  update: async (id: string, payload: Partial<PostRequestDto>): Promise<ForumPost> =>
    fetchWrapper.put(`/post/${id}`, payload),

  delete: async (id: string): Promise<void> => fetchWrapper.del(`/post/${id}`),
};
