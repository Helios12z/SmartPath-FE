'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { getCurrentProfile, getCurrentUser, updateProfile as updateProfileRequest } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';

type UpdatableProfileFields = Partial<
  Pick<UserProfile, 'full_name' | 'bio' | 'field_of_study' | 'avatar_url' | 'phone_number' | 'username'>
>;

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: UpdatableProfileFields) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => null,
  updateProfile: async () => {
    throw new Error('AuthProvider not initialized');
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const [currentUser, currentProfile] = await Promise.all([
        getCurrentUser(),
        getCurrentProfile(),
      ]);
      setUser(currentUser);
      setProfile(currentProfile);
      return currentProfile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setUser(null);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProfileUpdate = useCallback(
    async (updates: UpdatableProfileFields) => {
      const updatedProfile = await updateProfileRequest(updates);
      setProfile(updatedProfile);
      if (updatedProfile) {
        setUser((prev) =>
          prev ? { ...prev, email: updatedProfile.email, id: updatedProfile.id } : prev
        );
      }
      return updatedProfile;
    },
    []
  );

  useEffect(() => {
    refreshProfile();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'smartpath_current_user_id') {
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
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, updateProfile: handleProfileUpdate }}>
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
