'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';

import { userAPI } from '@/lib/api/userAPI';
import { signOut } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';

/** Cấu trúc dữ liệu AuthContext */
interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

/** Tạo context với giá trị mặc định an toàn */
const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
});

/** Provider chính bao quanh toàn bộ app */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔹 Hàm tải lại thông tin profile từ server dựa trên currentUserId trong localStorage
   */
  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) {
        setProfile(null);
        return;
      }

      const profileData = await userAPI.getById(currentUserId);
      setProfile(profileData);
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Hàm logout toàn hệ thống
   */
  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('user_info');
      setProfile(null);
    }
  }, []);

  /**
   * 🔹 Tự động refresh profile khi app khởi chạy hoặc localStorage thay đổi
   */
  useEffect(() => {
    refreshProfile();

    const handleStorageChange = (event: StorageEvent) => {
      if (
        ['currentUserId', 'access_token', 'refresh_token'].includes(event.key || '')
      ) {
        refreshProfile();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ profile, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook tiện dụng để dùng AuthContext trong bất kỳ component nào
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};