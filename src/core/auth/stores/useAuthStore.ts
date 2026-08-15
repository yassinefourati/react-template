import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/shared/types/roles';
import apiClient, { setupInterceptors } from '@/core/api/client';
import { env } from '@/core/config/env';

export interface AuthUser {
  id: number; name: string; email: string; role: Role;
}

interface AuthState {
  user: AuthUser | null;
  /** Access token — kept in memory, NOT in the persisted slice */
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetLockout: () => void;
  _setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      failedAttempts: 0,
      lockedUntil: null,

      login: async (email, password) => {
        const { failedAttempts, lockedUntil } = get();
        if (lockedUntil && Date.now() < lockedUntil) {
          const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
          throw new Error(`Too many attempts. Try again in ${secs}s.`);
        }
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', { email, password });

          const { accessToken, user } = response.data.data;
          set({
            user,
            accessToken,
            isAuthenticated: true,
            failedAttempts: 0,
            lockedUntil: null
          });
        } catch (e) {
          const next = failedAttempts + 1;
          set({ failedAttempts: next, lockedUntil: next >= env.VITE_LOGIN_MAX_ATTEMPTS ? Date.now() + 60_000 : null });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await import('@/shared/stores/useWebSocketStore')
          .then(({ useWebSocketStore }) => useWebSocketStore.getState().disconnect());
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      resetLockout: () => set({ failedAttempts: 0, lockedUntil: null }),
      _setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive fields — access token stays in memory
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, failedAttempts: s.failedAttempts, lockedUntil: s.lockedUntil }),
    }
  )
);

setupInterceptors(
  () => useAuthStore.getState().accessToken ?? undefined,
  () => useAuthStore.getState().logout(),
  (token) => useAuthStore.getState()._setAccessToken(token),
);
