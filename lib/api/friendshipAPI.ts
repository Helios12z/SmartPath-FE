import { fetchWrapper } from '@/lib/fetchWrapper';
import type {
  FriendshipRequestDto,
  FriendshipResponseDto,
  FriendSummaryDto,
} from '@/lib/types';

export const friendshipAPI = {
  getMine: async (): Promise<FriendSummaryDto[]> =>
    fetchWrapper.get('/friendship/mine'),

  getMineRaw: async (): Promise<FriendshipResponseDto[]> =>
    fetchWrapper.get('/friendship/mine'),

  follow: async (payload: FriendshipRequestDto): Promise<FriendshipResponseDto> =>
    fetchWrapper.post('/friendship/follow', payload),

  cancelFollow: async (followedUserId: string): Promise<void> =>
    fetchWrapper.del(`/friendship/${followedUserId}`),

  accept: async (friendshipId: string): Promise<FriendshipResponseDto> =>
    fetchWrapper.post(`/friendship/${friendshipId}/accept`, {}),

  reject: async (friendshipId: string): Promise<void> =>
    fetchWrapper.post(`/friendship/${friendshipId}/reject`, {}),
};
