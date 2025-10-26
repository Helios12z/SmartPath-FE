export type UserRole = 'student' | 'admin';

export interface StoredUser {
  id: string;
  email: string;
  username: string;

  fullName?: string | null;
  phoneNumber?: string | null;
  major?: string | null;
  faculty?: string | null;
  yearOfStudy?: number | null;
  bio?: string | null;
  avatarUrl?: string | null;

  role: UserRole;
  point: number;

  createdAt?: string;
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

export interface PostResponseDto {
  id: string;
  title: string;
  content: string;
  isQuestion: boolean;
  createdAt: string;            
  updatedAt?: string | null;
  authorUsername?: string | null;
  authorId: string;
  authorAvatarUrl?: string | null;
  commentCount: number;
  categories?: string[];
  isPositiveReacted: boolean | null;
  isNegativeReacted: boolean | null;
  negativeReactionCount: number;
  positiveReactionCount: number;
}

export interface PostRequestDto {
  title: string;
  content: string;
  isQuestion: boolean;
  categoryIds?: string[];
}

export interface CommentRequestDto {
  postId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface CommentResponseDto {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string | null;
  authorPoint: number;
  createdAt: string;               
  replies?: CommentResponseDto[];  
  isPositiveReacted: boolean | null;
  isNegativeReacted: boolean | null;
  negativeReactionCount: number;
  positiveReactionCount: number;
}

export type ReactionRequestDto = {
  postId?: string;
  commentId?: string;
  isPositive: boolean;
};

export type ReactionResponseDto = {
  id: string;
  isPositive: boolean;
  createdAt: string;
};

export interface ReportRequestDto {
  post_id: string;
  reason: string;
  details?: string;
}

export interface ChatOtherUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  name?: string | null;
  member1Id: string;
  member2Id: string;
  otherUser?: ChatOtherUser | null;   
  messages: Message[];
}

export interface ChatCreatePayload {
  member1Id: string;
  member2Id: string;
  name?: string | null;
}

export interface MessageRequestDto {
  chat_id: string;
  content: string;
}

export interface Notification {
  id: string 
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  url: string | null;
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
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  major?: string;
  faculty?: string;
  yearOfStudy?: number;
  bio?: string;
  avatarUrl?: string;
  role?: UserRole; 
}

export interface FriendshipRequestDto { followedUserId: string; }
export interface FriendshipResponseDto {
  followerId: string;
  followedUserId: string;
  createdAt: string;
}
export interface FriendSummaryDto {
  id: string;                 // userId của friend
  username: string;
  fullName?: string;
  avatarUrl?: string | null;
  point?: number;
  primaryBadge?: { id: string; name: string } | null;
  isMutual?: boolean;
}