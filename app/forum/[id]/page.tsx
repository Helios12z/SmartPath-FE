'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, MessageSquare, Eye, Send, Trash2, Edit } from 'lucide-react';
import { mockStore } from '@/lib/mockStore';
import type { Comment as CommentType, ForumPost, Subject, UserProfile, BadgeAward } from '@/lib/types';
import { UserBadge } from '@/components/badges/UserBadge';

type AuthorSummary = Pick<UserProfile, 'id' | 'full_name' | 'avatar_url' | 'reputation_points'> & {
  primaryBadge?: BadgeAward | null;
};

type DetailedPost = ForumPost & {
  author: AuthorSummary;
  subject?: Subject | null;
  views: number;
};

type CommentWithAuthor = CommentType & {
  author: AuthorSummary;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const buildAuthorSummary = (author?: UserProfile | null): AuthorSummary => ({
  id: author?.id ?? 'unknown',
  full_name: author?.full_name ?? 'Unknown User',
  avatar_url: author?.avatar_url ?? '',
  reputation_points: author?.reputation_points ?? 0,
  primaryBadge: author ? mockStore.getHighestBadgeForUser(author.id) : null,
});

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const postId = params.id as string;

  const [post, setPost] = useState<DetailedPost | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPost = useCallback(() => {
    const postRecord = mockStore.getPostById(postId);

    if (!postRecord) {
      toast({
        title: 'Post not found',
        description: 'Redirecting back to the forum.',
        variant: 'destructive',
      });
      router.push('/forum');
      return;
    }

    const authorProfile = mockStore.getUserById(postRecord.author_id);
    const subject = postRecord.subject_id
      ? mockStore.getSubjects().find((item) => item.id === postRecord.subject_id) ?? null
      : null;
    const positiveReactions = mockStore
      .getReactions()
      .filter((reaction) => reaction.post_id === postId && reaction.is_positive);

    setPost({
      ...postRecord,
      author: buildAuthorSummary(authorProfile),
      subject,
      views: postRecord.views ?? Math.floor(Math.random() * 120) + 120,
    });

    setLikesCount(positiveReactions.length);
    setIsLiked(
      Boolean(
        user && positiveReactions.some((reaction) => reaction.user_id === user.id)
      )
    );
    setLoading(false);
  }, [postId, toast, router, user]);

  const loadComments = useCallback(() => {
    const commentRecords = mockStore
      .getComments()
      .filter((comment) => comment.post_id === postId && !comment.parent_comment_id)
      .map((comment) => ({
        ...comment,
        author: buildAuthorSummary(mockStore.getUserById(comment.author_id)),
      }));

    setComments(commentRecords);
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    loadPost();
    loadComments();
  }, [postId, loadPost, loadComments]);

  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    const reactions = mockStore.getReactions();
    const existingReaction = reactions.find(
      (reaction) =>
        reaction.post_id === postId &&
        reaction.user_id === user.id &&
        reaction.is_positive
    );

    if (existingReaction) {
      mockStore.removeReaction((reaction) => reaction.id === existingReaction.id);
      setIsLiked(false);
      setLikesCount((prev) => Math.max(prev - 1, 0));
      toast({
        title: 'Success',
        description: 'Removed like',
      });
    } else {
      mockStore.addReaction({
        id: generateId(),
        post_id: postId,
        user_id: user.id,
        is_positive: true,
        created_at: new Date().toISOString(),
      });
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      toast({
        title: 'Success',
        description: 'Post liked',
      });
    }
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !profile || !newComment.trim()) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingComment(true);

    try {
      const timestamp = new Date().toISOString();
      const commentRecord: CommentType = {
        id: generateId(),
        post_id: postId,
        author_id: profile.id,
        content: newComment.trim(),
        parent_comment_id: null,
        created_at: timestamp,
        updated_at: timestamp,
      };

      mockStore.addComment(commentRecord);
      setComments((prev) => [
        ...prev,
        {
          ...commentRecord,
          author: buildAuthorSummary(profile),
        },
      ]);
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (error) {
      console.error('Failed to add comment', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = () => {
    toast({
      title: 'Feature coming soon',
      description: 'Post deletion will be available in the future.',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Fetching post details</p>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Post not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="icon" className="flex items-center gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar_url ?? undefined} alt={post.author.full_name} />
              <AvatarFallback>{post.author.full_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              {post.author.primaryBadge && (
                <div>
                  <UserBadge badge={post.author.primaryBadge} size="md" />
                </div>
              )}
              <Link href={`/profile/${post.author.id}`} className="font-medium hover:underline block truncate">
                {post.author.full_name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{post.author.reputation_points} pts</Badge>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          {user?.id === post.author_id && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDeletePost}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            {post.subject && (
              <Badge variant="outline">
                {post.subject.code} - {post.subject.name}
              </Badge>
            )}
          </div>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
              {likesCount}
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submittingComment}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submittingComment || !newComment.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>

          <Separator />

          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar_url ?? undefined} alt={comment.author.full_name} />
                    <AvatarFallback>
                      {comment.author.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3">
                      <div className="flex flex-col gap-1 mb-1">
                        {comment.author.primaryBadge && (
                          <UserBadge badge={comment.author.primaryBadge} size="sm" />
                        )}
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${comment.author.id}`} className="font-medium text-sm hover:underline">
                            {comment.author.full_name}
                          </Link>
                          <Badge variant="secondary" className="text-xs">
                            {comment.author.reputation_points} pts
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground px-3">
                      <span>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
