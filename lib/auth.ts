import { userAPI } from "./api/userAPI";

export type AuthUser = {
  id: string;
  email?: string;
};

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_ID_KEY = "currentUserId";

const getStorage = () => (typeof window !== "undefined" ? window.localStorage : null);

export function getSessionUserId(): string | null {
  const storage = getStorage();
  return storage?.getItem(USER_ID_KEY) || null;
}

export function setSessionUserId(userId: string | null) {
  const storage = getStorage();
  if (!storage) return;
  if (userId) storage.setItem(USER_ID_KEY, userId);
  else storage.removeItem(USER_ID_KEY);
}

export async function signIn(emailOrUsername: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!res.ok) throw new Error("Invalid email or password");

  const data = await res.json();
  if (!data?.accessToken || !data?.refreshToken || !data?.currentUserId)
    throw new Error("Invalid response from server");

  localStorage.setItem(ACCESS_KEY, data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(USER_ID_KEY, data.currentUserId);

  return data;
}

export async function signOut() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_KEY);
  storage.removeItem(REFRESH_KEY);
  storage.removeItem(USER_ID_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = getSessionUserId();
  if (!userId) return null;
  return { id: userId };
}

export async function getCurrentProfile() {
  const userId = localStorage.getItem("currentUserId");
  if (!userId) return null;

  try {
    const profile = await userAPI.getById(userId);
    return profile;
  } catch (error) {
    console.error("Failed to fetch current profile:", error);
    return null;
  }
}
