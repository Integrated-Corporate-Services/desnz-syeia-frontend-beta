import { create } from 'zustand';
import type { AuthUser } from '../types/auth';
import type { AuthUserResponse } from '../services/authService';
import { signOut as signOutService } from '../services/authService';

interface AuthStoreState {
  authenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  setAuth: (response: AuthUserResponse) => void;
  setError: (error: Error) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  authenticated: false,
  user: null,
  loading: true,
  error: null,
  setAuth: (response: AuthUserResponse) => {
    set({
      authenticated: response.authenticated,
      user: response.user,
      loading: false,
      error: null,
    });
  },
  setError: (error: Error) => {
    set({
      error,
      loading: false,
      authenticated: false,
      user: null,
    });
  },
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  signOut: async () => {
    await signOutService();
    set({ authenticated: false, user: null, loading: false, error: null });
  },
}));