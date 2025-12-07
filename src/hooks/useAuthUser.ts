/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { DEMO_USER_ID, DEMO_USER_EMAIL } from '../constants/demo';
import type { AuthUser } from '../types/auth';

const LOGIN_DISABLED = true;

// import.meta.env.VITE_LOGIN_DISABLED === 'true';

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (LOGIN_DISABLED) {
      setUser({ user_id: DEMO_USER_ID, email: DEMO_USER_EMAIL, isDemo: true });
      setLoading(false);
      return;
    }
    fetch('/backend/auth/user', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
}
