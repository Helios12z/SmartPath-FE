import {
  mockUsers,
  mockPosts,
  mockReactions,
  mockComments,
  mockCategories,
  mockCategoryPost,
  mockSubjects,
  mockEvents,
  mockEventRegistrations,
  mockBadges,
  mockUserAchievements,
} from './mockData';
import {
  StoredUser,
  UserProfile,
  ForumPost,
  Reaction,
  Comment,
  Category,
  CategoryPost,
  Subject,
  EventItem,
  EventRegistration,
  Badge,
  BadgeAward,
  UserAchievement,
  EventRegistrationStatus,
} from './types';

type MockState = {
  users: StoredUser[];
  posts: ForumPost[];
  reactions: Reaction[];
  comments: Comment[];
  categories: Category[];
  categoryPost: CategoryPost[];
  subjects: Subject[];
  events: EventItem[];
  eventRegistrations: EventRegistration[];
  badges: Badge[];
  userAchievements: UserAchievement[];
};

const ensureUserShape = (user: any): StoredUser => ({
  ...user,
  reputation_points: user.reputation_points ?? user.point ?? 0,
  password: user.password ?? 'password123',
  updated_at: user.updated_at ?? user.created_at,
});

const state: MockState = {
  users: mockUsers.map((user) => ensureUserShape(user)),
  posts: mockPosts.map((post) => ({
    ...post,
    subject_id: post.subject_id ?? null,
  })),
  reactions: mockReactions.map((reaction) => ({ ...reaction })),
  comments: mockComments.map((comment) => ({ ...comment })),
  categories: mockCategories.map((category) => ({ ...category })),
  categoryPost: mockCategoryPost.map((relation) => ({ ...relation })),
  subjects: mockSubjects.map((subject) => ({ ...subject })),
  events: mockEvents.map((event) => ({ ...event })),
  eventRegistrations: mockEventRegistrations.map((registration) => ({ ...registration })),
  badges: mockBadges.map((badge) => ({ ...badge })),
  userAchievements: mockUserAchievements.map((achievement) => ({ ...achievement })),
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const computeUserBadges = (userId: string | undefined | null): BadgeAward[] => {
  if (!userId) return [];

  return state.userAchievements
    .filter((achievement) => achievement.user_id === userId)
    .map((achievement) => {
      const badge = state.badges.find((item) => item.id === achievement.badge_id);
      if (!badge) return null;
      return {
        ...badge,
        awarded_at: achievement.awarded_at,
        note: achievement.note,
      };
    })
    .filter((value): value is BadgeAward => value !== null)
    .sort((a, b) => a.point - b.point);
};

const sanitizeUser = (user: StoredUser): UserProfile => {
  const { password, ...safeUser } = user;
  return { ...safeUser };
};

export const mockStore = {
  getUsers(): UserProfile[] {
    return state.users.map((user) => sanitizeUser(user));
  },

  getStoredUsers(): StoredUser[] {
    return state.users;
  },

  getUserById(id: string): UserProfile | null {
    const user = state.users.find((item) => item.id === id);
    return user ? sanitizeUser(user) : null;
  },

  getStoredUserById(id: string): StoredUser | undefined {
    return state.users.find((item) => item.id === id);
  },

  getStoredUserByEmail(email: string): StoredUser | undefined {
    return state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  },

  createUser(user: StoredUser): UserProfile {
    state.users.push(user);
    return sanitizeUser(user);
  },

  updateUser(userId: string, updates: Partial<Omit<StoredUser, 'id' | 'email'>>) {
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updates, {
      updated_at: new Date().toISOString(),
    });

    return sanitizeUser(user);
  },

  getPosts(): ForumPost[] {
    return state.posts.map((post) => ({ ...post }));
  },

  getPostById(postId: string): ForumPost | null {
    const post = state.posts.find((item) => item.id === postId);
    return post ? { ...post } : null;
  },

  addPost(post: ForumPost) {
    state.posts.unshift(post);
  },

  getComments(): Comment[] {
    return state.comments.map((comment) => ({ ...comment }));
  },

  addComment(comment: Comment) {
    state.comments.push(comment);
  },

  getReactions(): Reaction[] {
    return state.reactions.map((reaction) => ({ ...reaction }));
  },

  addReaction(reaction: Reaction) {
    state.reactions.push(reaction);
  },

  removeReaction(predicate: (reaction: Reaction) => boolean) {
    const index = state.reactions.findIndex(predicate);
    if (index >= 0) {
      state.reactions.splice(index, 1);
    }
  },

  getCategories(): Category[] {
    return state.categories.map((category) => ({ ...category }));
  },

  getCategoryPostRelations(): CategoryPost[] {
    return state.categoryPost.map((relation) => ({ ...relation }));
  },

  addCategoryPostRelation(relation: CategoryPost) {
    state.categoryPost.push(relation);
  },

  getSubjects(): Subject[] {
    return state.subjects.map((subject) => ({ ...subject }));
  },

  getEvents(): EventItem[] {
    return state.events.map((event) => ({ ...event }));
  },

  getEventById(eventId: string): EventItem | null {
    const event = state.events.find((item) => item.id === eventId);
    return event ? { ...event } : null;
  },

  getEventRegistrations(): EventRegistration[] {
    return state.eventRegistrations.map((registration) => ({ ...registration }));
  },

  getUserEventRegistration(userId: string, eventId: string): EventRegistration | null {
    const registration = state.eventRegistrations.find(
      (item) => item.user_id === userId && item.event_id === eventId,
    );
    return registration ? { ...registration } : null;
  },

  upsertEventRegistration(userId: string, eventId: string, status: EventRegistrationStatus) {
    const existing = state.eventRegistrations.find(
      (item) => item.user_id === userId && item.event_id === eventId,
    );

    if (existing) {
      existing.status = status;
      existing.created_at = new Date().toISOString();
    } else {
      state.eventRegistrations.push({
        id: generateId(),
        event_id: eventId,
        user_id: userId,
        status,
        created_at: new Date().toISOString(),
      });
    }
  },

  removeEventRegistration(userId: string, eventId: string) {
    const index = state.eventRegistrations.findIndex(
      (item) => item.user_id === userId && item.event_id === eventId,
    );
    if (index >= 0) {
      state.eventRegistrations.splice(index, 1);
    }
  },

  getBadges(): Badge[] {
    return state.badges.map((badge) => ({ ...badge }));
  },

  getUserAchievements(userId: string | undefined | null): UserAchievement[] {
    if (!userId) return [];
    return state.userAchievements
      .filter((achievement) => achievement.user_id === userId)
      .map((achievement) => ({ ...achievement }));
  },

  getBadgeById(badgeId: string): Badge | null {
    const badge = state.badges.find((item) => item.id === badgeId);
    return badge ? { ...badge } : null;
  },

  getUserBadges(userId: string | undefined | null): BadgeAward[] {
    return computeUserBadges(userId);
  },

  getHighestBadgeForUser(userId: string | undefined | null): BadgeAward | null {
    const badges = computeUserBadges(userId);
    if (!badges.length) return null;
    const highest = badges[badges.length - 1];
    return { ...highest };
  },

  addUserAchievement(userId: string, badgeId: string, note?: string) {
    const alreadyHave = state.userAchievements.some(
      (achievement) => achievement.user_id === userId && achievement.badge_id === badgeId,
    );

    if (alreadyHave) return;

    state.userAchievements.push({
      id: generateId(),
      user_id: userId,
      badge_id: badgeId,
      awarded_at: new Date().toISOString(),
      note,
    });
  },
};

export const sanitizeUserProfile = sanitizeUser;
