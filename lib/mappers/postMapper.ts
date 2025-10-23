import type { PostResponseDto } from '@/lib/types';

export type UIPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  is_question: boolean;
  created_at: string;
  updated_at: string | null;

  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    reputation_points: number;
    primaryBadge: { id: string; name: string; point: number } | null;
  };

  likes_count: number;
  comments_count: number;
  tags: Array<{ id: string; name: string; color?: string }>;
};

export function mapPostToUI(p: PostResponseDto): UIPost {
  return {
    id: p.id,
    author_id: p.authorId,                       
    title: p.title,
    content: p.content,
    is_question: p.isQuestion,
    created_at: p.createdAt,
    updated_at: p.updatedAt ?? null,

    author: {
      id: p.authorId,
      full_name: p.authorUsername ?? 'Unknown',
      avatar_url: p.authorAvatarUrl ?? null,
      reputation_points: 0,      
      primaryBadge: null,        
    },

    likes_count: p.reactionCount,
    comments_count: p.commentCount,
    tags: (p.categories ?? []).map((name) => ({ id: name, name })),
  };
}
