import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TokenResponse, UserResponse } from '@/src/api/generated/apiSchema';
import { secureStorage } from '@/src/shared/storage/tokenStorage';

interface AuthState {
  // 状態
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // アクション
  login: (tokens: TokenResponse) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: TokenResponse) => void;
  setUser: (user: UserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  initialize: () => Promise<void>;
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
      login: async (tokens: TokenResponse) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
        // zustand persist middleware が secureStorage 経由で自動保存
      },

      // ログアウト処理
      logout: async () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        // zustand persist middleware が secureStorage 経由で自動削除
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

      // 初期化処理（アプリ起動時に呼び出す）
      initialize: async () => {
        const state = get();
        if (state.accessToken && state.refreshToken) {
          set({ isAuthenticated: true });
        }
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
          if (state) {
            state.setHydrated(true);
            // トークンが存在すれば認証済みとする
            if (state.accessToken && state.refreshToken) {
              state.setTokens({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
              });
            }
          }
        };
      },
    }
  )
);
