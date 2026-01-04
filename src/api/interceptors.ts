import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/src/shared/stores/authStore';
import { apiClient } from './apiClient';

interface InterceptorConfig {
  onLogout: () => void;
}

// リフレッシュ中フラグ
let isRefreshing = false;

// 失敗したリクエストのキュー
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

/**
 * テスト用: インターセプターの内部状態をリセット
 * 本番コードでは通常呼び出す必要はありません
 */
export function resetInterceptorState(): void {
  isRefreshing = false;
  failedQueue = [];
}

/**
 * キュー内のリクエストを処理
 */
function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * リフレッシュトークンのエンドポイントかどうかを判定
 * URL文字列マッチングより堅牢な判定方法
 */
export function isRefreshTokenEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  // パスの末尾が /api/auth/refresh であるかを判定（クエリパラメータを除外）
  const pathname = url.split('?')[0];
  return pathname.endsWith('/api/auth/refresh');
}

/**
 * Axios Interceptors のセットアップ
 * 401エラー時に自動的にトークンをリフレッシュし、リクエストを再試行する
 */
export function setupAxiosInterceptors(
  axiosInstance: AxiosInstance,
  config: InterceptorConfig
): void {
  // Response Interceptor
  axiosInstance.interceptors.response.use(
    // 成功時はそのまま返す
    (response) => response,
    // エラー時の処理
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // 401エラーかつリトライしていない場合
      if (error.response?.status === 401 && !originalRequest._retry) {
        // リフレッシュトークンのエンドポイント自体は除外
        if (isRefreshTokenEndpoint(originalRequest.url)) {
          return Promise.reject(error);
        }

        // 既にリフレッシュ中の場合はキューに追加
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // レースコンディション対策: 状態を一括取得してスナップショットとして保持
        const authState = useAuthStore.getState();
        const refreshToken = authState.refreshToken;

        if (!refreshToken) {
          isRefreshing = false;
          config.onLogout();
          return Promise.reject(new Error('No refresh token available'));
        }

        try {
          // トークンリフレッシュを実行
          const response = await apiClient.refreshToken(refreshToken);
          const newAccessToken = response.accessToken;

          // 新しいトークンを設定
          useAuthStore.getState().setTokens(response);
          apiClient.setAccessToken(newAccessToken);

          // キュー内のリクエストを新しいトークンで処理
          processQueue(null, newAccessToken);

          // 元のリクエストを新しいトークンで再試行
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // リフレッシュ失敗時はログアウト
          processQueue(refreshError as Error, null);
          config.onLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
