import { create } from 'zustand';
import { UserProfile } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// In-Memory Zustand store for JWT token and user profile
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (token: string, user: UserProfile) =>
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
