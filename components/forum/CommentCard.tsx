// src/components/forum/CommentCard.tsx
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsDown, Send } from 'lucide-react';

import type { UIComment } from '@/lib/mappers/commentMapper';

interface CommentCardProps {
  comment: UIComment;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onSubmitReply?: (parentId: string, content: string) => Promise<void> | void;
  canReply?: boolean; // mặc định true với depth < maxDepth ở page
  showChildren?: boolean; // render children đệ quy
}

export function CommentCard({
  comment,
  onLike,
  onDislike,
  onSubmitReply,
  canReply = true,
  showChildren = true,
}: CommentCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const liked = comment.isPositiveReacted === true;
  const disliked = comment.isNegativeReacted === true;

  const handleSend = async () => {
    const content = replyText.trim();
    if (!content || !onSubmitReply) return;
    await onSubmitReply(comment.id, content);
    setReplyText('');
    setReplyOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar_url ?? undefined} />
          <AvatarFallback>
            {(comment.author.full_name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/profile/${comment.author.id}`}
                  className="font-medium text-sm hover:underline"
                >
                  {comment.author.full_name}
                </Link>
                <Badge variant="secondary" className="text-[10px]">
                  {comment.author.reputation_points} pts
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {/* LIKE */}
                <button
                  type="button"
                  onClick={() => onLike?.(comment.id)}
                  className={`inline-flex items-center gap-1 hover:text-foreground transition ${
                    liked ? 'text-red-500' : ''
                  }`}
                  title={liked ? 'Unlike' : 'Like'}
                >
                  <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-red-500' : ''}`} />
                  <span>{comment.positiveReactionCount}</span>
                </button>

                {/* DISLIKE */}
                <button
                  type="button"
                  onClick={() => onDislike?.(comment.id)}
                  className={`inline-flex items-center gap-1 hover:text-foreground transition ${
                    disliked ? 'text-blue-500' : ''
                  }`}
                  title={disliked ? 'Clear dislike' : 'Dislike'}
                >
                  <ThumbsDown className={`h-3.5 w-3.5 ${disliked ? 'fill-blue-500' : ''}`} />
                  <span>{comment.negativeReactionCount}</span>
                </button>

                {/* REPLY */}
                {canReply && comment.depth < 2 && (
                  <button
                    type="button"
                    onClick={() => setReplyOpen((s) => !s)}
                    className="hover:text-foreground transition"
                  >
                    Reply
                  </button>
                )}
              </div>

              {/* Reply box */}
              {canReply && comment.depth < 2 && replyOpen && onSubmitReply && (
                <div className="mt-2">
                  <Textarea
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Children */}
          {showChildren && comment.children?.length > 0 && (
            <div className="pl-6 mt-2 space-y-3">
              {comment.children.map((child) => (
                <CommentCard
                  key={child.id}
                  comment={child}
                  onLike={onLike}
                  onDislike={onDislike}
                  onSubmitReply={onSubmitReply}
                  canReply={canReply}
                  showChildren={showChildren}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
