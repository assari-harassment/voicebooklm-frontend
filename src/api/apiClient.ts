import axios, { isAxiosError } from 'axios';
import {
  Api,
  ListFoldersResponse,
  ListMemosResponse,
  MemoDetailResponse,
  TokenResponse,
  VoiceMemoCreatedResponse,
} from './generated/apiSchema';
import { File } from 'expo-file-system';
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
   * 音声ファイルからメモを生成
   * React Native用のFormData送信方式を使用
   */
  async createMemoFromAudio(
    audioFilePath: string,
    language: string = 'ja-JP'
  ): Promise<VoiceMemoCreatedResponse> {
    // ファイルの存在確認
    const file = new File(audioFilePath);
    if (!file.exists) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // React Native用のFormDataを作成
    const formData = new FormData();

    // React Nativeでは、uri/type/nameを持つオブジェクトをappendする
    // 注意: MIMEタイプは "audio/wav" を明示的に指定
    // iOSは "audio/vnd.wave" を送信することがあるため
    formData.append('file', {
      uri: audioFilePath,
      type: 'audio/wav', // audio/vnd.wave ではなく audio/wav を使用
      name: 'recording.wav',
    } as unknown as Blob);

    // axiosで直接送信（生成されたAPIクライアントはFormData処理に問題があるため）
    try {
      if (__DEV__) {
        console.log('Uploading audio file:', audioFilePath);
        console.log('Token:', this.accessToken ? 'Set' : 'Not set');
      }

      const response = await axios.post<VoiceMemoCreatedResponse>(
        `${API_BASE_URL}/api/voice/memos`,
        formData,
        {
          params: { language },
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (__DEV__ && isAxiosError(error)) {
        console.error('API Error Status:', error.response?.status);
        console.error('API Error Data:', JSON.stringify(error.response?.data));
        console.error('API Error Headers:', JSON.stringify(error.response?.headers));
      }
      throw error;
    }
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
    sort?: string;
    order?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListMemosResponse> {
    const response = await this.api.api.listMemos(params, { secure: true });
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
   * フォルダー一覧を取得
   */
  async listFolders(): Promise<ListFoldersResponse> {
    const response = await this.api.api.listFolders({ secure: true });
    return response.data;
  }
}

export const apiClient = new ApiClient();
