import { fetchWrapper } from '@/lib/fetchWrapper';
import type { ReactionResponseDto, ReactionRequestDto } from '@/lib/types';

export const reactionAPI = {
  react: (payload: ReactionRequestDto): Promise<ReactionResponseDto> =>
    fetchWrapper.post('/reaction', payload),

  removePost: (postId: string): Promise<void> =>
    fetchWrapper.del(`/reaction/remove-post-reaction/${postId}`),

  removeComment: (commentId: string): Promise<void> =>
    fetchWrapper.del(`/reaction/remove-comment-reaction/${commentId}`),
};
