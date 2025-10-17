import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  field_of_study?: string;
  role: 'student' | 'lecturer' | 'admin';
  reputation_points: number;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  subject_id?: string;
  views: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  semester?: number;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  parent_id?: string;
  created_at: string;
};

export type Material = {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  uploader_id: string;
  subject_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  downloads: number;
  created_at: string;
  updated_at: string;
};

export type StudyGroup = {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  leader_id: string;
  subject_id?: string;
  is_private: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accepted' | 'message' | 'mention' | 'group_invite';
  title: string;
  content?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
};
