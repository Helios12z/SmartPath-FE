import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsDown, Send, ImagePlus, FilePlus2, FileText, X } from 'lucide-react';

import type { UIComment } from '@/lib/mappers/commentMapper';

type QueuedImage = { id: string; file: File; preview: string };
type QueuedDoc = { id: string; file: File };
const uid = () => Math.random().toString(36).slice(2);

interface CommentCardProps {
  comment: UIComment;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onSubmitReply?: (
    parentId: string,
    content: string,
    images: File[],
    docs: File[]
  ) => Promise<void> | void;
  canReply?: boolean;
  showChildren?: boolean;
  onPreview?: (url: string) => void;
}

export function CommentCard({
  comment,
  onLike,
  onDislike,
  onSubmitReply,
  canReply = true,
  showChildren = true,
  onPreview,
}: CommentCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [images, setImages] = useState<QueuedImage[]>([]);
  const [docs, setDocs] = useState<QueuedDoc[]>([]);

  const liked = comment.isPositiveReacted === true;
  const disliked = comment.isNegativeReacted === true;

  const onPickImages = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    const next = accepted.map((f) => ({ id: uid(), file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...next]);
  };
  const onPickDocs = (files: FileList | null) => {
    if (!files) return;
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/vnd.rar',
      'application/x-rar-compressed',
    ];
    const accepted = Array.from(files).filter((f) => allowed.includes(f.type) || f.name.endsWith('.rar'));
    const next = accepted.map((f) => ({ id: uid(), file: f }));
    setDocs((prev) => [...prev, ...next]);
  };
  const removeImage = (id: string) => {
    setImages((prev) => {
      const t = prev.find((x) => x.id === id);
      if (t) URL.revokeObjectURL(t.preview);
      return prev.filter((x) => x.id !== id);
    });
  };
  const removeDoc = (id: string) => setDocs((prev) => prev.filter((x) => x.id !== id));

  const handleSend = async () => {
    const content = replyText.trim();
    if (!content || !onSubmitReply) return;
    const imageFiles = images.map((i) => i.file);
    const docFiles = docs.map((d) => d.file);
    await onSubmitReply(comment.id, content, imageFiles, docFiles);
    // reset local
    setReplyText('');
    images.forEach((i) => URL.revokeObjectURL(i.preview));
    setImages([]);
    setDocs([]);
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

              {/* Attachments (nếu có) */}
              {(comment.images?.length || comment.documents?.length) ? (
                <div className="mt-3 space-y-3">
                  {comment.images && comment.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {comment.images.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          className="relative aspect-square overflow-hidden rounded-lg border hover:opacity-90"
                          onClick={() => onPreview?.(img.fileUrl)}
                          title={img.title}
                        >
                          <img src={img.fileUrl} alt={img.title} className="object-cover w-full h-full" />
                        </button>
                      ))}
                    </div>
                  )}

                  {comment.documents && comment.documents.length > 0 && (
                    <div className="space-y-2">
                      {comment.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{doc.title || doc.fileUrl}</span>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="text-sm underline hover:opacity-80"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
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

              {canReply && comment.depth < 2 && replyOpen && onSubmitReply && (
                <div className="mt-3 space-y-3">
                  {/* Textarea + 2 icon góc phải-dưới */}
                  <div className="relative">
                    <Textarea
                      placeholder="Reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="pr-20" // chừa chỗ cho 2 icon
                    />

                    {/* Hidden inputs */}
                    <input
                      id={`reply-img-${comment.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => onPickImages(e.target.files)}
                    />
                    <input
                      id={`reply-doc-${comment.id}`}
                      type="file"
                      accept=".pdf,.docx,.xlsx,.pptx,.zip,.rar,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/vnd.rar,application/x-rar-compressed"
                      multiple
                      className="hidden"
                      onChange={(e) => onPickDocs(e.target.files)}
                    />

                    {/* 2 icon ở góc phải-dưới */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Attach document"
                        onClick={() => document.getElementById(`reply-doc-${comment.id}`)?.click()}
                      >
                        <FilePlus2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Attach image"
                        onClick={() => document.getElementById(`reply-img-${comment.id}`)?.click()}
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Previews gọn */}
                  {(images.length > 0 || docs.length > 0) && (
                    <div className="space-y-2">
                      {images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {images.map((img) => (
                            <div
                              key={img.id}
                              className="relative w-16 h-16 rounded-md overflow-hidden border shrink-0"
                              title={img.file.name}
                            >
                              <img src={img.preview} className="object-cover w-full h-full" />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-background/90 rounded-full p-0.5 border"
                                onClick={() => removeImage(img.id)}
                                aria-label="Remove image"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {docs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {docs.map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center gap-2 rounded border px-2 py-1 text-xs"
                              title={d.file.name}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span className="max-w-[180px] truncate">{d.file.name}</span>
                              <button
                                type="button"
                                className="ml-1"
                                onClick={() => removeDoc(d.id)}
                                aria-label="Remove document"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSend} disabled={!replyText.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                  onPreview={onPreview}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}