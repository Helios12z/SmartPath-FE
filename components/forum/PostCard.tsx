import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Eye, Pin, ThumbsDown } from 'lucide-react';
import { UserBadge } from '@/components/badges/UserBadge';
import type { UIPost } from '@/lib/mappers/postMapper';

interface PostCardProps {
  post: UIPost & {
    views?: number;
    is_pinned?: boolean;
  };
  onLike?: () => void;
  onDislike?: () => void;
  isLiked?: boolean;     
  isDisliked?: boolean;  
}

export function PostCard({
  post,
  onLike,
  onDislike,
  isLiked,
  isDisliked,
}: PostCardProps) {
  const liked = typeof isLiked === 'boolean' ? isLiked : post.isPositiveReacted === true;
  const disliked = typeof isDisliked === 'boolean' ? isDisliked : post.isNegativeReacted === true;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url ?? undefined} alt={post.author.full_name} />
              <AvatarFallback>{post.author.full_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 min-w-0">
                {post.author.primaryBadge && (
                  <div>
                    <UserBadge badge={post.author.primaryBadge} size="sm" />
                  </div>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-medium hover:underline truncate"
                  >
                    {post.author.full_name}
                  </Link>
                  <Badge variant="secondary" className="text-xs">
                    {post.author.reputation_points} pts
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {post.is_pinned && <Pin className="h-4 w-4 text-blue-600 flex-shrink-0" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Link href={`/forum/${post.id}`}>
          <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{ borderColor: tag.color, color: tag.color }}
                className="text-xs"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          {/* LIKE */}
          <button
            onClick={onLike}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors"
            title={liked ? 'Unlike' : 'Like'}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.positiveReactionCount}</span>
          </button>

          {/* DISLIKE */}
          <button
            onClick={onDislike}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
            title={disliked ? 'Clear dislike' : 'Dislike'}
            aria-label={disliked ? 'Clear dislike' : 'Dislike'}
          >
            <ThumbsDown className={`h-4 w-4 ${disliked ? 'fill-blue-500 text-blue-500' : ''}`} />
            <span>{post.negativeReactionCount}</span>
          </button>

          {/* COMMENTS */}
          <Link
            href={`/forum/${post.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
            title="Comments"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments_count}</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}