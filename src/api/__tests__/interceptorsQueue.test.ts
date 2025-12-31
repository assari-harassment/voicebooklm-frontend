import { useAuthStore } from '@/src/shared/stores/authStore';
import { apiClient } from '../apiClient';

/**
 * interceptors.ts のキューイング機能のテスト
 * 同時リクエスト時のprocessQueue関数とisRefreshingフラグの動作を検証
 */
import type { AxiosHeaders, AxiosInstance } from 'axios';

// モック（各テストで新鮮なモジュール状態を使用）
jest.mock('@/src/shared/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

jest.mock('../apiClient', () => ({
  apiClient: {
    refreshToken: jest.fn(),
    setAccessToken: jest.fn(),
  },
}));

const mockUseAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('interceptors queue handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // isRefreshingフラグをリセットするためにモジュールをリセット
    jest.resetModules();
  });

  it('同時リクエストがキューに追加され、リフレッシュ成功時に全て処理される', async () => {
    // フレッシュなモジュールをインポート
    const { setupAxiosInterceptors } = await import('../interceptors');
    const { useAuthStore: freshAuthStore } = await import('@/src/shared/stores/authStore');
    const { apiClient: freshApiClient } = await import('../apiClient');

    const mockFreshAuthStore = freshAuthStore as jest.Mocked<typeof useAuthStore>;
    const mockFreshApiClient = freshApiClient as jest.Mocked<typeof apiClient>;

    // Axiosインスタンスのモック（呼び出し可能）
    const axiosFn = jest.fn();
    const mockAxiosInstance = Object.assign(axiosFn, {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }) as unknown as jest.Mocked<AxiosInstance> & jest.Mock;

    const mockOnLogout = jest.fn();
    setupAxiosInterceptors(mockAxiosInstance, { onLogout: mockOnLogout });

    const responseUse = mockAxiosInstance.interceptors.response.use as jest.Mock;
    const errorHandler = responseUse.mock.calls[0][1];

    const mockSetTokens = jest.fn();
    mockFreshAuthStore.getState.mockReturnValue({
      refreshToken: 'refresh-token',
      accessToken: 'access-token',
      setTokens: mockSetTokens,
    } as unknown as ReturnType<typeof useAuthStore.getState>);

    // リフレッシュを遅延させてキューイングを可能にする
    let resolveRefresh:
      | ((value: { accessToken: string; refreshToken: string }) => void)
      | undefined;
    mockFreshApiClient.refreshToken.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    const mockRetryResponse = { status: 200, data: { success: true } };
    axiosFn.mockResolvedValue(mockRetryResponse);

    const mockHeaders = { Authorization: '' } as unknown as AxiosHeaders;
    const createError = (url: string) => ({
      response: { status: 401 },
      config: { url, headers: mockHeaders },
    });

    // 最初のリクエストを開始（リフレッシュをトリガー）
    const firstPromise = errorHandler(createError('/api/users'));

    // イベントループを進めて最初のリクエストがリフレッシュを開始するのを待つ
    await new Promise((resolve) => setImmediate(resolve));

    // 2番目のリクエストを開始（キューに追加される）
    const secondPromise = errorHandler(createError('/api/notes'));

    // リフレッシュを完了
    resolveRefresh!({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // 両方のリクエストが成功することを確認
    const [result1, result2] = await Promise.all([firstPromise, secondPromise]);

    expect(result1).toBe(mockRetryResponse);
    expect(result2).toBe(mockRetryResponse);
    expect(mockFreshApiClient.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('同時リクエストでリフレッシュ失敗時にキュー全体がエラーになる', async () => {
    // フレッシュなモジュールをインポート
    const { setupAxiosInterceptors } = await import('../interceptors');
    const { useAuthStore: freshAuthStore } = await import('@/src/shared/stores/authStore');
    const { apiClient: freshApiClient } = await import('../apiClient');

    const mockFreshAuthStore = freshAuthStore as jest.Mocked<typeof useAuthStore>;
    const mockFreshApiClient = freshApiClient as jest.Mocked<typeof apiClient>;

    const axiosFn = jest.fn();
    const mockAxiosInstance = Object.assign(axiosFn, {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }) as unknown as jest.Mocked<AxiosInstance> & jest.Mock;

    const mockOnLogout = jest.fn();
    setupAxiosInterceptors(mockAxiosInstance, { onLogout: mockOnLogout });

    const responseUse = mockAxiosInstance.interceptors.response.use as jest.Mock;
    const errorHandler = responseUse.mock.calls[0][1];

    const mockSetTokens = jest.fn();
    mockFreshAuthStore.getState.mockReturnValue({
      refreshToken: 'refresh-token',
      accessToken: 'access-token',
      setTokens: mockSetTokens,
    } as unknown as ReturnType<typeof useAuthStore.getState>);

    // リフレッシュを遅延して失敗させる
    let rejectRefresh: ((error: Error) => void) | undefined;
    mockFreshApiClient.refreshToken.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRefresh = reject;
        })
    );

    const mockHeaders = { Authorization: '' } as unknown as AxiosHeaders;
    const createError = (url: string) => ({
      response: { status: 401 },
      config: { url, headers: mockHeaders },
    });

    // 最初のリクエストを開始
    const firstPromise = errorHandler(createError('/api/users'));

    // イベントループを進める
    await new Promise((resolve) => setImmediate(resolve));

    // 2番目のリクエストをキューに追加
    const secondPromise = errorHandler(createError('/api/notes'));

    // リフレッシュを失敗させる
    const refreshError = new Error('Refresh failed');
    rejectRefresh!(refreshError);

    // 両方のリクエストがエラーになることを確認
    await expect(firstPromise).rejects.toBe(refreshError);
    await expect(secondPromise).rejects.toBe(refreshError);
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
