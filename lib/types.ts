export type UserRole = 'student' | 'lecturer' | 'admin';

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  phone_number?: string;
  full_name: string;
  major?: string | null;
  field_of_study?: string | null;
  faculty?: string | null;
  year_of_study?: number | null;
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

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  is_positive: boolean;
  created_at: string;
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

export interface Category {
  id: string;
  name: string;
}

export interface CategoryPost {
  id?: string;
  post_id: string;
  category_id: string;
}

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

export type EventRegistrationStatus = 'going' | 'interested';

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

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  semester?: number;
}

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
  EmailOrUsername: String
  Password: String
}

export type RegisterRequest = {
  Email: String
  Username: String
  Password: String
  FullName: String
}

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  currentUserId: string;
};