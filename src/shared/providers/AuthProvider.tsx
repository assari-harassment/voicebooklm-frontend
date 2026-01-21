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
 * - refreshToken からの accessToken 再取得（Web対応）
 * - トークン存在時は /api/auth/me で検証
 * - 検証中は AuthLoadingScreen を表示
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isHydrated, accessToken, refreshToken, setTokens, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // hydration が完了するまで待機
      if (!isHydrated) {
        return;
      }

      // refreshToken がない場合は未認証として初期化完了
      if (!refreshToken) {
        setIsInitializing(false);
        return;
      }

      // accessToken がない場合は refreshToken から再取得を試みる
      // （Web でのページリロード時など）
      let currentAccessToken = accessToken;
      if (!currentAccessToken) {
        try {
          if (__DEV__) {
            console.log('[AuthProvider] Refreshing access token from refresh token...');
          }
          const tokens = await apiClient.refreshToken(refreshToken);
          setTokens(tokens);
          currentAccessToken = tokens.accessToken;
        } catch (error) {
          if (__DEV__) {
            console.error('[AuthProvider] Failed to refresh token:', error);
          }
          // リフレッシュ失敗時はログアウト
          logout();
          setIsInitializing(false);
          return;
        }
      }

      // accessToken で認証状態を検証
      try {
        // APIクライアントにアクセストークンを設定
        apiClient.setAccessToken(currentAccessToken);

        // /api/auth/me でトークンの有効性を検証
        const user = await apiClient.getCurrentUser();
        setUser(user);
      } catch (error: unknown) {
        // エラー種別に応じて処理を分岐
        const status = (error as { response?: { status?: number } })?.response?.status;

        if (status === 401 || status === 403 || status === 404) {
          // トークンが無効、またはユーザーが存在しない場合はログアウト
          logout();
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
  }, [isHydrated, accessToken, refreshToken, setTokens, setUser, logout]);

  // 初期化中はローディング画面を表示
  if (!isHydrated || isInitializing) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
