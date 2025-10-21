import { fetchWrapper } from '@/lib/fetchWrapper';
import type { Reaction, ReactionRequestDto } from '@/lib/types';

export const reactionAPI = {
  react: async (payload: ReactionRequestDto): Promise<Reaction> =>
    fetchWrapper.post('/reaction', payload),

  remove: async (postId: string): Promise<void> =>
    fetchWrapper.del(`/reaction/${postId}`),
};
