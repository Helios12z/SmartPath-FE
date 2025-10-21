import { fetchWrapper } from "@/lib/fetchWrapper";
import type { DecodedJwt, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "../types";

const decodeJWT = (token: string | null | undefined): DecodedJwt | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);

    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(
            Array.prototype.map
              .call(atob(padded), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        : Buffer.from(padded, "base64").toString("utf8");

    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isExpired = (decoded: DecodedJwt | null): boolean => {
  if (!decoded?.exp) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return decoded.exp <= nowSec;
};

const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);

export const authAPI = {
  /** Login với email hoặc username */
  loginWithIdentifier: async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const payload: LoginRequest = {
      EmailOrUsername: trimmed,
      Password: password,
    };
    return authAPI.login(payload);
  },

  /** Login chính */
  login: async (payload: LoginRequest) => {
    const res = await fetchWrapper.post<AuthResponse>("/auth/login", payload, false);

    if (res?.accessToken && res?.refreshToken) {
      localStorage.setItem("access_token", res.accessToken);
      localStorage.setItem("refresh_token", res.refreshToken);

      const decoded = decodeJWT(res.accessToken);
      if (decoded) {
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          })
        );
      }
    }

    return res;
  },

  /** Register tài khoản mới */
  register: async (payload: RegisterRequest) => {
    const res = await fetchWrapper.post<AuthResponse>("/auth/register", payload, false);

    if (res?.accessToken && res?.refreshToken) {
      localStorage.setItem("access_token", res.accessToken);
      localStorage.setItem("refresh_token", res.refreshToken);

      const decoded = decodeJWT(res.accessToken);
      if (decoded) {
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          })
        );
      }
    }

    return res;
  },

  /** Refresh access token */
  refresh: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token found.");

    const res = await fetchWrapper.post<AuthResponse>(
      "/auth/refresh",
      { refreshToken },
      false
    );

    if (res?.accessToken) localStorage.setItem("access_token", res.accessToken);
    if (res?.refreshToken) localStorage.setItem("refresh_token", res.refreshToken);

    const decoded = decodeJWT(res.accessToken);
    if (decoded) {
      localStorage.setItem(
        "user_info",
        JSON.stringify({
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        })
      );
    }

    return res;
  },

  /** Logout và clear localStorage */
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
  },

  /** Kiểm tra đã đăng nhập và token còn hạn không */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("access_token");
    const decoded = decodeJWT(token);
    if (!decoded || isExpired(decoded)) return false;
    return true;
  },

  /** Lấy access token hiện tại */
  getToken: () => localStorage.getItem("access_token"),

  /** Lấy thông tin user đã lưu */
  getUserInfo: <T = Pick<UserProfile, "id" | "email" | "role">>(): T | null => {
    const raw = localStorage.getItem("user_info");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};

export default authAPI;
