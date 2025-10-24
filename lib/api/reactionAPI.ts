import { fetchWrapper } from '@/lib/fetchWrapper';
import type { ReactionResponseDto, ReactionRequestDto } from '@/lib/types';

export const reactionAPI = {
  react: (payload: ReactionRequestDto): Promise<ReactionResponseDto> =>
    fetchWrapper.post('/reaction', payload),

  remove: (payload: { postId?: string; commentId?: string }): Promise<void> =>
    fetchWrapper.del('/reaction', { body: JSON.stringify(payload) }),
};
