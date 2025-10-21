import { mockStore, sanitizeUserProfile } from './mockStore';
import { StoredUser, UserProfile } from './types';

const SESSION_KEY = 'smartpath_current_user_id';

export type AuthUser = Pick<StoredUser, 'id' | 'email'>;

const getStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

const getSessionUserId = (): string | null => {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(SESSION_KEY);
};

const setSessionUserId = (userId: string | null) => {
  const storage = getStorage();
  if (!storage) return;

  if (userId) {
    storage.setItem(SESSION_KEY, userId);
  } else {
    storage.removeItem(SESSION_KEY);
  }
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const buildUsername = (fullName: string, fallback: string) => {
  const base = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  if (!base) return `user.${fallback.slice(0, 5)}`;

  const existingUsers = mockStore.getStoredUsers();
  let candidate = base;
  let suffix = 1;

  while (existingUsers.some((user) => user.username?.toLowerCase() === candidate)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const ensureAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  email: user.email,
});

export async function signUp(email: string, password: string, fullName: string) {
  const existingUser = mockStore.getStoredUserByEmail(email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const userId = generateId();
  const now = new Date().toISOString();
  const username = buildUsername(fullName || email, userId);

  const newUser: StoredUser = {
    id: userId,
    email,
    username,
    password,
    full_name: fullName,
    phone_number: undefined,
    major: null,
    field_of_study: null,
    faculty: null,
    year_of_study: null,
    bio: '',
    avatar_url: `https://avatar.vercel.sh/${encodeURIComponent(fullName || email)}`,
    role: 'student',
    point: 0,
    reputation_points: 0,
    created_at: now,
    updated_at: now,
  };

  mockStore.createUser(newUser);
  setSessionUserId(userId);

  return {
    user: ensureAuthUser(newUser),
    profile: sanitizeUserProfile(newUser),
  };
}

export async function signOut() {
  setSessionUserId(null);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return { id: data.id, email: data.email };
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const userId = getSessionUserId();
  if (!userId) return null;

  const storedUser = mockStore.getStoredUserById(userId);
  return storedUser ? sanitizeUserProfile(storedUser) : null;
}

export async function updateProfile(updates: Partial<Pick<UserProfile, 'full_name' | 'bio' | 'field_of_study' | 'avatar_url' | 'phone_number' | 'username'>>) {
  const userId = getSessionUserId();
  if (!userId) {
    throw new Error('Not authenticated.');
  }

  return mockStore.updateUser(userId, updates);
}
