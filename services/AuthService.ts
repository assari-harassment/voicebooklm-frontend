import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { apiClient, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './api';
import {
  TokenResponse,
  GoogleAuthRequest,
  RefreshTokenRequest,
  LogoutRequest,
  UserResponse,
} from '@/api/generated/apiSchema';

// Web ブラウザ認証のクリーンアップ
WebBrowser.maybeCompleteAuthSession();

/**
 * 認証状態
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  error: string | null;
}

// OpenAPI 生成済みの型を流用
type UserInfo = UserResponse;

/**
 * JWT クレーム（デコード用）
 */
interface JwtPayload {
  exp: number;
  userId: string;
  email: string;
}

/**
 * 認証サービス
 *
 * Google OAuth 認証、トークン管理、自動リフレッシュ、ログアウトを提供。
 */
class AuthService {
  /**
   * Google OAuth でログイン
   *
   * @param idToken Google ID トークン
   * @returns トークンペア
   */
  async loginWithGoogle(idToken: string): Promise<TokenResponse> {
    try {
      const payload: GoogleAuthRequest = { idToken };
      const response = await apiClient.post<TokenResponse>('/api/auth/google', payload);

      const { accessToken, refreshToken } = response.data;

      // トークンをセキュアストレージに保存
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Google ログインに失敗しました');
    }
  }

  /**
   * トークンリフレッシュ
   *
   * @returns 新しいトークンペア
   */
  async refreshAccessToken(): Promise<TokenResponse> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('リフレッシュトークンがありません');
    }

    try {
      const payload: RefreshTokenRequest = { refreshToken };
      const response = await apiClient.post<TokenResponse>('/api/auth/refresh', payload);

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // 新しいトークンを保存
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

      return response.data;
    } catch (error: any) {
      // リフレッシュ失敗時はトークンを削除
      await this.clearTokens();
      throw new Error(error.response?.data?.error || 'トークンリフレッシュに失敗しました');
    }
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        const payload: LogoutRequest = { refreshToken };
        await apiClient.post('/api/auth/logout', payload);
      }
    } catch (error) {
      // ログアウト API エラーは無視（サーバーサイドでのトークン無効化は保証できない）
      console.warn('Logout API error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  /**
   * アカウント削除
   */
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/api/auth/account');
      await this.clearTokens();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'アカウント削除に失敗しました');
    }
  }

  /**
   * 現在のユーザー情報を取得
   *
   * @returns ユーザー情報
   */
  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await apiClient.get<UserInfo>('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'ユーザー情報の取得に失敗しました');
    }
  }

  /**
   * 保存されたトークンを取得
   *
   * @returns トークンペア（存在しない場合は null）
   */
  async getStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  }

  /**
   * アクセストークンが有効かどうかを判定
   *
   * @returns トークンが有効な場合は true
   */
  async isTokenValid(): Promise<boolean> {
    const { accessToken } = await this.getStoredTokens();
    if (!accessToken) {
      return false;
    }

    try {
      const payload = this.decodeToken(accessToken);
      if (!payload) {
        return false;
      }

      // 有効期限チェック（30秒のバッファを持たせる）
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now + 30;
    } catch {
      return false;
    }
  }

  /**
   * 認証状態を確認し、必要に応じてリフレッシュ
   *
   * @returns 認証済みの場合は true
   */
  async checkAuthState(): Promise<boolean> {
    const { accessToken, refreshToken } = await this.getStoredTokens();

    // トークンがない場合は未認証
    if (!accessToken || !refreshToken) {
      return false;
    }

    // アクセストークンが有効な場合はそのまま
    if (await this.isTokenValid()) {
      return true;
    }

    // アクセストークンが期限切れの場合はリフレッシュ
    try {
      await this.refreshAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * トークンをデコード
   */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * トークンをクリア
   */
  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export const authService = new AuthService();
