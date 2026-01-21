import {
  Api,
  FormatMemoResponse,
  ListFoldersResponse,
  ListMemosResponse,
  MemoDetailResponse,
  TagsResponse,
  TokenResponse,
  UpdateMemoRequest,
} from './generated/apiSchema';
import { setupAxiosInterceptors } from './interceptors';
import { useAuthStore } from '@/src/shared/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// APIクライアントのシングルトンインスタンス
class ApiClient {
  private api: Api<string>;
  private accessToken: string | null = null;

  constructor() {
    this.api = new Api({
      baseURL: API_BASE_URL,
      securityWorker: async (token) => {
        if (token) {
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
        return {};
      },
    });

    // Axios Interceptors をセットアップ
    setupAxiosInterceptors(this.api.instance, {
      onLogout: () => useAuthStore.getState().logout(),
    });
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    this.api.setSecurityData(token);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser() {
    const response = await this.api.api.getCurrentUser({ secure: true });
    return response.data;
  }

  /**
   * Googleログイン
   */
  async loginWithGoogle(idToken: string): Promise<TokenResponse> {
    const response = await this.api.api.loginWithGoogle({ idToken }, { secure: false });
    return response.data;
  }

  /**
   * ログアウト
   */
  async logout(refreshToken: string) {
    await this.api.api.logout({ refreshToken }, { secure: true });
  }

  /**
   * トークンリフレッシュ
   */
  async refreshToken(refreshToken: string) {
    const response = await this.api.api.refreshToken({ refreshToken }, { secure: false });
    return response.data;
  }

  /**
   * メモ一覧を取得
   */
  async listMemos(params?: {
    folderId?: string;
    includeDescendants?: boolean;
    uncategorizedOnly?: boolean;
    keyword?: string;
    tags?: string[];
    sort?: string;
    order?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListMemosResponse> {
    const response = await this.api.api.listMemos(params, { secure: true });
    return response.data;
  }

  /**
   * タグ一覧を取得する
   */
  async listTags(params?: {
    sort?: string;
    order?: string;
    limit?: number;
  }): Promise<TagsResponse> {
    const response = await this.api.api.listTags(params, { secure: true });
    return response.data;
  }

  /**
   * メモ詳細を取得
   */
  async getMemo(memoId: string): Promise<MemoDetailResponse> {
    const response = await this.api.api.getMemo(memoId, { secure: true });
    return response.data;
  }

  /**
   * メモを削除
   */
  async deleteMemo(memoId: string): Promise<void> {
    await this.api.api.deleteMemo(memoId, { secure: true });
  }

  /**
   * メモを更新
   */
  async updateMemo(memoId: string, data: UpdateMemoRequest): Promise<MemoDetailResponse> {
    const response = await this.api.api.updateMemo(memoId, data, { secure: true });
    return response.data;
  }

  /**
   * フォルダー一覧を取得
   */
  async listFolders(): Promise<ListFoldersResponse> {
    const response = await this.api.api.listFolders({ secure: true });
    return response.data;
  }

  /**
   * 文字起こし結果を整形してメモを作成
   * POST /api/memos/format
   */
  async formatMemo(transcription: string, language: string = 'ja-JP'): Promise<FormatMemoResponse> {
    if (__DEV__) {
      console.log('Formatting transcript, length:', transcription.length);
    }

    const response = await this.api.api.formatMemo({ transcription, language }, { secure: true });
    return response.data;
  }
}

export const apiClient = new ApiClient();
