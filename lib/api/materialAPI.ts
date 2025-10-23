import { fetchWrapper } from '@/lib/fetchWrapper';

export type MaterialResponse = {
  id: string;
  uploaderId: string;
  postId?: string | null;
  commentId?: string | null;
  messageId?: string | null;
  title: string;
  description?: string | null;
  fileUrl: string;
  uploadedAt: string;
};

type MaterialMeta = {
  postId?: string;
  commentId?: string;
  messageId?: string;
  title: string;        
  description?: string; 
};

export const materialAPI = {
  uploadImage: async (file: File, meta: MaterialMeta): Promise<MaterialResponse> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', meta.title);
    if (meta.description) fd.append('description', meta.description);
    if (meta.postId) fd.append('postId', meta.postId);
    if (meta.commentId) fd.append('commentId', meta.commentId);
    if (meta.messageId) fd.append('messageId', meta.messageId);

    return await fetchWrapper.postForm<MaterialResponse>('/material/images', fd);
  },

  uploadDocuments: async (files: File[], meta: MaterialMeta): Promise<MaterialResponse[]> => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    fd.append('title', meta.title);
    if (meta.description) fd.append('description', meta.description);
    if (meta.postId) fd.append('postId', meta.postId);
    if (meta.commentId) fd.append('commentId', meta.commentId);
    if (meta.messageId) fd.append('messageId', meta.messageId);

    return await fetchWrapper.postForm<MaterialResponse[]>('/material/documents', fd);
  },

  listByPost: async (postId: string): Promise<MaterialResponse[]> => {
    return await fetchWrapper.get<MaterialResponse[]>(`/material/by-post/${postId}`);
  },

  delete: async (id: string): Promise<void> => {
    return await fetchWrapper.del<void>(`/material/${id}`);
  },
};