import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API ベース URL（開発環境用）
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// セキュアストレージのキー
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * API クライアントインスタンス
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * リクエストインターセプタ - アクセストークンを自動的に付与
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 認証不要のエンドポイントはスキップ
    if (config.url?.startsWith('/api/auth/') && !config.url?.endsWith('/me') && !config.url?.endsWith('/account')) {
      return config;
    }

    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * レスポンスインターセプタ - 401 エラー時にトークンリフレッシュを試行
 */
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 エラーかつリトライ済みでない場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 認証エンドポイントへのリクエストはリフレッシュしない
      if (originalRequest.url?.startsWith('/api/auth/') && !originalRequest.url?.endsWith('/me')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 既にリフレッシュ中の場合は待機
        return new Promise((resolve) => {
          subscribeTokenRefresh((newAccessToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // トークンリフレッシュ
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // 新しいトークンを保存
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

        // 待機中のリクエストを処理
        onTokenRefreshed(newAccessToken);

        // 元のリクエストを再実行
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // リフレッシュ失敗 - ログアウト
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, API_BASE_URL };
