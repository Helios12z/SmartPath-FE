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

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};