export type UserRole = 'student' | 'admin';

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  phone_number?: string;
  full_name: string;
  field_of_study?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  point?: number;
  reputation_points: number;
  password: string;            
  created_at: string;
  updated_at?: string;
}

export type UserProfile = Omit<StoredUser, 'password'>;

export type DecodedJwt = {
  sub?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  email?: string;
  role?: string | string[];
  [key: string]: any;
};

export type LoginRequest = {
  EmailOrUsername: string;
  Password: string;
};

export type RegisterRequest = {
  Email: string;
  Username: string;
  Password: string;
  FullName: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  currentUserId: string;
};

export interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  is_question: boolean;
  created_at: string;
  updated_at: string;
  is_deleted_at?: string | null;
  subject_id?: string | null;
  views?: number;
}

export interface PostRequestDto {
  title: string;
  content: string;
  is_question: boolean;
  subject_id?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommentRequestDto {
  post_id: string;
  content: string;
  parent_comment_id?: string | null;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  is_positive: boolean;
  created_at: string;
}

export interface ReactionRequestDto {
  post_id: string;
  is_positive: boolean;
}

export interface ReportRequestDto {
  post_id: string;
  reason: string;
  details?: string;
}

export interface Chat {
  id: string;
  participant_ids: string[];
  title?: string | null;
  last_message?: string | null;
  updated_at: string;
}

export interface ChatRequestDto {
  participant_ids: string[];
  title?: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface MessageRequestDto {
  chat_id: string;
  content: string;
}

export interface Notification {
  id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  link?: string | null;
}

export interface SystemLog {
  id: string;
  user_id: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CategoryPost {
  id?: string;
  post_id: string;
  category_id: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  semester?: number;
}

export type EventRegistrationStatus = 'going' | 'interested';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_at: string;
  end_at: string;
  category: string;
  host_id: string;
  banner_url?: string;
  capacity?: number;
  attendees_count?: number;
  is_virtual?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: EventRegistrationStatus;
  created_at: string;
}

export interface Badge {
  id: string;
  point: number;
  name: string;
  description?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  note?: string;
}

export interface BadgeAward extends Badge {
  awarded_at: string;
  note?: string;
}

export interface UserRequestDto {
  email: string;
  username: string;
  full_name?: string;
  phone_number?: string;
  field_of_study?: string;
  avatar_url?: string;
  role?: string;
}