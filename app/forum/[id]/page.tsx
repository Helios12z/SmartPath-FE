'use client';

import { useState, useEffect } from 'react';
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
import { mockPosts, mockUsers, mockReactions, mockComments, currentUser } from '@/lib/mockData';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      incrementViews();
    }
  }, [postId, user]);

  const fetchPost = async () => {
    try {
      const postData = mockPosts.find(p => p.id === postId);

      if (!postData) {
        router.push('/forum');
        return;
      }

      const author = mockUsers.find(u => u.id === postData.author_id);
      const reactions = mockReactions.filter(r => r.post_id === postId && r.is_positive);

      setPost({
        ...postData,
        author: {
          id: author?.id,
          full_name: author?.full_name,
          avatar_url: author?.avatar_url,
          reputation_points: author?.point
        },
        views: 127
      });

      setLikesCount(reactions.length);

      if (user) {
        const userLike = reactions.find(r => r.user_id === currentUser.id);
        setIsLiked(!!userLike);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const postComments = mockComments
        .filter(c => c.post_id === postId && !c.parent_comment_id)
        .map(comment => {
          const author = mockUsers.find(u => u.id === comment.author_id);
          return {
            ...comment,
            author: {
              id: author?.id,
              full_name: author?.full_name,
              avatar_url: author?.avatar_url,
              reputation_points: author?.point
            }
          };
        });

      setComments(postComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const incrementViews = async () => {
    console.log('View incremented (mock)');
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }

      toast({
        title: 'Success',
        description: isLiked ? 'Removed like' : 'Post liked',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const newCommentObj = {
        id: `comment${Date.now()}`,
        post_id: postId,
        author_id: currentUser.id,
        content: newComment,
        parent_comment_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          id: currentUser.id,
          full_name: currentUser.full_name,
          avatar_url: currentUser.avatar_url,
          reputation_points: currentUser.point
        }
      };

      setComments([...comments, newCommentObj]);

      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });

      setNewComment('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      router.push('/forum');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar_url} alt={post.author.full_name} />
                <AvatarFallback>{post.author.full_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/profile/${post.author.id}`}
                  className="font-medium hover:underline"
                >
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
          </div>
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
          <h2 className="text-xl font-semibold">
            Comments ({comments.length})
          </h2>
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
                    <AvatarImage src={comment.author.avatar_url} alt={comment.author.full_name} />
                    <AvatarFallback>
                      {comment.author.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${comment.author.id}`}
                          className="font-medium text-sm hover:underline"
                        >
                          {comment.author.full_name}
                        </Link>
                        <Badge variant="secondary" className="text-xs">
                          {comment.author.reputation_points} pts
                        </Badge>
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
