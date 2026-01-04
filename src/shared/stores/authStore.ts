import type { TokenResponse, UserResponse } from '@/src/api/generated/apiSchema';
import { secureStorage } from '@/src/shared/storage/tokenStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  // 状態
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // アクション
  login: (tokens: TokenResponse) => void;
  logout: () => void;
  setTokens: (tokens: TokenResponse) => void;
  setUser: (user: UserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初期状態
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      // ログイン処理
      login: (tokens: TokenResponse) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      // ログアウト処理
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      // トークンを設定（同期）
      setTokens: (tokens: TokenResponse) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      // ユーザー情報を設定
      setUser: (user: UserResponse | null) => {
        set({ user });
      },

      // ローディング状態を設定
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // hydration 完了状態を設定
      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      // トークンのみ永続化（ユーザー情報は除外）
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // hydration 完了時のコールバック
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error && __DEV__) {
            console.error('Auth hydration failed:', error);
          }
          const hasTokens = Boolean(state?.accessToken && state?.refreshToken);
          useAuthStore.setState({
            isHydrated: true,
            isAuthenticated: hasTokens,
          });
        };
      },
    }
  )
);
