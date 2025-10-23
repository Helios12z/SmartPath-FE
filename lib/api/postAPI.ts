import { fetchWrapper } from '@/lib/fetchWrapper';
import type { PostRequestDto, PostResponseDto } from '@/lib/types';

export const postAPI = {
  getAll: async (): Promise<PostResponseDto[]> =>
    fetchWrapper.get('/post'),

  getById: async (id: string): Promise<PostResponseDto> =>
    fetchWrapper.get(`/post/${id}`),

  getByUser: async (userId: string): Promise<PostResponseDto[]> =>
    fetchWrapper.get(`/post/by-user/${userId}`),

  create: async (payload: PostRequestDto): Promise<PostResponseDto> =>
    fetchWrapper.post('/post', payload),

  update: async (id: string, payload: Partial<PostRequestDto>): Promise<PostResponseDto> =>
    fetchWrapper.put(`/post/${id}`, payload),

  delete: async (id: string): Promise<void> =>
    fetchWrapper.del(`/post/${id}`),
};
