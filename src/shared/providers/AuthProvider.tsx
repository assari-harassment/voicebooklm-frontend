import { apiClient } from '@/src/api';
import { AuthLoadingScreen } from '@/src/features/auth/AuthLoadingScreen';
import { useAuthStore } from '@/src/shared/stores/authStore';
import { useEffect, useState } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 認証状態を管理するプロバイダー
 * - hydration 完了を待機
 * - トークン存在時は /api/auth/me で検証
 * - 検証中は AuthLoadingScreen を表示
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isHydrated, accessToken, refreshToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // hydration が完了するまで待機
      if (!isHydrated) {
        return;
      }

      // トークンが存在しない場合は初期化完了
      if (!accessToken || !refreshToken) {
        setIsInitializing(false);
        return;
      }

      try {
        // APIクライアントにアクセストークンを設定
        apiClient.setAccessToken(accessToken);

        // /api/auth/me でトークンの有効性を検証
        const user = await apiClient.getCurrentUser();
        setUser(user);
      } catch (error: unknown) {
        // エラー種別に応じて処理を分岐
        const status = (error as { response?: { status?: number } })?.response?.status;

        if (status === 401 || status === 403) {
          // トークンが明確に無効な場合のみログアウト
          await logout();
        } else {
          // ネットワークエラー等の一時的な問題は、既存トークンを信頼して続行
          if (__DEV__) {
            console.warn(
              '[AuthProvider] Token validation failed, continuing with existing token:',
              error
            );
          }
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [isHydrated, accessToken, refreshToken, setUser, logout]);

  // 初期化中はローディング画面を表示
  if (!isHydrated || isInitializing) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
