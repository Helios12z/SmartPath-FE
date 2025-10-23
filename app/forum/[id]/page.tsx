'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { postAPI } from '@/lib/api/postAPI';
import { reactionAPI } from '@/lib/api/reactionAPI';
import { materialAPI, type MaterialResponse } from '@/lib/api/materialAPI';
import { commentAPI } from '@/lib/api/commentAPI'; 
import { userAPI } from '@/lib/api/userAPI';

import type { PostResponseDto, CommentResponseDto, CommentRequestDto } from '@/lib/types';
import { mapPostToUI, type UIPost } from '@/lib/mappers/postMapper';
import { mapUserToPostOwner, type PostOwner } from '@/lib/mappers/postOwnerMapper';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, MessageSquare, Send, Trash2, Edit, FileText, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const getExt = (url: string) => {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() ?? '';
    const qless = last.split('?')[0];
    const dot = qless.lastIndexOf('.');
    return dot >= 0 ? qless.slice(dot).toLowerCase() : '';
  } catch {
    const clean = url.split('?')[0];
    const dot = clean.lastIndexOf('.');
    return dot >= 0 ? clean.slice(dot).toLowerCase() : '';
  }
};
const isImageUrl = (url: string) => {
  const ext = getExt(url);
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return true;
  return /imgbb\.com|i\.ibb\.co|ibb\.co/.test(url);
};

export default function PostDetailPage() {
  const { id: postId } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rawPost, setRawPost] = useState<PostResponseDto | null>(null);
  const [owner, setOwner] = useState<PostOwner | null>(null);
  const uiPost = useMemo<UIPost | null>(() => (rawPost ? mapPostToUI(rawPost) : null), [rawPost]);

  // likes
  const [isLiked, setIsLiked] = useState(false); 
  const [likesCount, setLikesCount] = useState(0);

  // comments
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // materials
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const images = materials.filter((m) => isImageUrl(m.fileUrl));
  const documents = materials.filter((m) => !isImageUrl(m.fileUrl));

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const openPreview = (url: string) => { setPreviewUrl(url); setPreviewOpen(true); };

  const loadPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const post = await postAPI.getById(postId);
      setRawPost(post);
      setLikesCount(post.reactionCount ?? 0);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load post', variant: 'destructive' });
      router.push('/forum');
    } finally {
      setLoading(false);
    }
  }, [postId, router, toast]);

  const loadMaterials = useCallback(async () => {
    if (!postId) return;
    try {
      const list = await materialAPI.listByPost(postId);
      setMaterials(list);
    } catch (e) {
      console.error('Failed to load attachments', e);
    }
  }, [postId]);

  const loadComments = useCallback(async () => {
    if (!postId) return;
    try {
      const list = await commentAPI.getByPost(postId);
      setComments(list);
    } catch (e) {
      console.error('Failed to load comments', e);
    }
  }, [postId]);

  const loadOwnerInformation = useCallback(async ()=>{
    if (!postId) return
    try {
      const user=await userAPI.getById(rawPost?.authorId??"")
      const postOwner=mapUserToPostOwner(user)
      setOwner(postOwner);
    }
    catch (e) {
      console.error('Failed to load post owner information')
    }
  }, [postId])

  useEffect(() => {
    loadPost();
    loadMaterials();
    loadComments();
    loadOwnerInformation();
  }, [loadPost, loadMaterials, loadComments, loadOwnerInformation]);

  const handleLike = async () => {
    if (!profile?.id || !postId) {
      toast({ title: 'Sign in required', description: 'Please sign in to like posts.', variant: 'destructive' });
      return;
    }
    const already = isLiked;
    setIsLiked(!already);
    setLikesCount((c) => c + (already ? -1 : 1));
    try {
      if (already) {
        await reactionAPI.remove(postId);
        toast({ title: 'Success', description: 'Removed like' });
      } else {
        await reactionAPI.react({ post_id: postId, is_positive: true });
        toast({ title: 'Success', description: 'Post liked' });
      }
    } catch (e) {
      setIsLiked(already);
      setLikesCount((c) => c + (already ? 1 : -1));
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update reaction', variant: 'destructive' });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!profile?.id || !postId || !newComment.trim()) {
    toast({ title: 'Sign in required', description: 'Please sign in to comment.', variant: 'destructive' });
    return;
  }
  setSubmittingComment(true);
  try {
    const payload: CommentRequestDto = {
      content: newComment.trim(),
      postId: postId,
      parentCommentId: null 
    };
    const created = await commentAPI.create(payload);   
    setComments((prev) => [...prev, created]);          
    setNewComment('');
    toast({ title: 'Success', description: 'Comment posted successfully' });
  } catch (e) {
    console.error(e);
    toast({ title: 'Error', description: 'Failed to post comment.', variant: 'destructive' });
  } finally {
    setSubmittingComment(false);
  }
};

  if (loading || !uiPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div><p className="text-muted-foreground">Loading post...</p></div>
        </div>
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Fetching post details</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={uiPost.author.avatar_url ?? undefined} alt={uiPost.author.full_name} />
              <AvatarFallback>{uiPost.author.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <Link href={`/profile/${uiPost.author.id}`} className="font-medium hover:underline block truncate">
                {uiPost.author.full_name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{uiPost.author.reputation_points ?? 0} pts</Badge>
                <span>{formatDistanceToNow(new Date(uiPost.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {profile?.id === uiPost.author_id && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" title="Edit (coming soon)">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Delete (coming soon)">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{uiPost.title}</h1>

            {/* tags */}
            {uiPost.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uiPost.tags.map(t => (
                  <Badge key={t.id} variant="outline" style={t.color ? { borderColor: t.color, color: t.color } : {}}>
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <p className="text-base leading-relaxed whitespace-pre-wrap">{uiPost.content}</p>

          {/* Attachments */}
          {(images.length > 0 || documents.length > 0) && (
            <div className="space-y-4">
              <Separator />
              <h3 className="font-semibold">Attachments</h3>

              {/* Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      className="relative aspect-square overflow-hidden rounded-lg border hover:opacity-90"
                      onClick={() => openPreview(img.fileUrl)}
                      title={img.title}
                    >
                      <img src={img.fileUrl} alt={img.title} className="object-cover w-full h-full" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{doc.title || doc.fileUrl}</span>
                      </div>
                      <div className="shrink-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-2 text-sm underline-offset-2 hover:underline"
                          title="Open / Download"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? 'text-red-500' : ''}>
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
              {likesCount}
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{uiPost.comments_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Image preview</DialogTitle></DialogHeader>
          {previewUrl && <img src={previewUrl} alt="preview" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Comments */}
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
            <p className="text-center text-muted-foreground py-8">Chưa có comment nào!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.authorAvatarUrl ?? undefined} />
                    <AvatarFallback>{(c.authorUsername || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profile/${c.authorId}`} className="font-medium text-sm hover:underline">
                          {c.authorUsername}
                        </Link>
                        {typeof c.authorPoint === 'number' && (
                          <Badge variant="secondary" className="text-xs">{c.authorPoint} pts</Badge>
                        )}
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground px-3">
                      <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
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