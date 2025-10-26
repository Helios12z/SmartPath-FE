import { fetchWrapper } from '@/lib/fetchWrapper';
import { BadgeRequestDto, BadgeResponseDto } from '../types';

export const badgeAPI = {
  getAll: async (): Promise<BadgeResponseDto[]> =>
    fetchWrapper.get('/badge'),

  getById: async (id: string): Promise<BadgeResponseDto> =>
    fetchWrapper.get(`/badge/${id}`),

  getByPoint: async (point: number): Promise<BadgeResponseDto> =>
    fetchWrapper.get(`/badge/by-point/${point}`),

  getByName: async (name: string): Promise<BadgeResponseDto> =>
    fetchWrapper.get(`/badge/by-name/${encodeURIComponent(name)}`),

  create: async (payload: BadgeRequestDto): Promise<BadgeResponseDto> =>
    fetchWrapper.post('/badge', payload),

  update: async (id: string, payload: BadgeRequestDto): Promise<BadgeResponseDto> =>
    fetchWrapper.put(`/badge/${id}`, payload),

  delete: async (id: string): Promise<void> =>
    fetchWrapper.del(`/badge/${id}`),
};
