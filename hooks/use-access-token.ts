'use client';
import { useEffect, useRef, useState } from 'react';

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const read = () => {
      const t = localStorage.getItem('access_token');
      tokenRef.current = t;
      setToken(t);
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token') read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { token, tokenRef };
}