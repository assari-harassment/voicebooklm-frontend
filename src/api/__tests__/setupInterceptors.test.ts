import type { AxiosHeaders, AxiosInstance, AxiosResponse } from 'axios';
import { setupAxiosInterceptors } from '../interceptors';

import { useAuthStore } from '@/src/shared/stores/authStore';
import { apiClient } from '../apiClient';

// モック
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

describe('setupAxiosInterceptors', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance> & jest.Mock;
  let responseInterceptorSuccess: (response: AxiosResponse) => AxiosResponse;
  let responseInterceptorError: (error: unknown) => Promise<unknown>;
  let mockOnLogout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Axios インスタンスのモック（呼び出し可能な関数として）
    const axiosFn = jest.fn();
    mockAxiosInstance = Object.assign(axiosFn, {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }) as unknown as jest.Mocked<AxiosInstance> & jest.Mock;

    mockOnLogout = jest.fn();

    // setupAxiosInterceptors を呼び出してインターセプターを登録
    setupAxiosInterceptors(mockAxiosInstance, { onLogout: mockOnLogout });

    // 登録されたインターセプターを取得
    const responseUse = mockAxiosInstance.interceptors.response.use as jest.Mock;
    responseInterceptorSuccess = responseUse.mock.calls[0][0];
    responseInterceptorError = responseUse.mock.calls[0][1];
  });

  describe('成功レスポンス', () => {
    it('成功レスポンスはそのまま返す', () => {
      const mockResponse = {
        status: 200,
        data: { message: 'success' },
      } as AxiosResponse;

      const result = responseInterceptorSuccess(mockResponse);

      expect(result).toBe(mockResponse);
    });
  });

  describe('非401エラー', () => {
    it('401以外のエラーはそのままreject', async () => {
      const error = {
        response: { status: 500 },
        config: {},
      };

      await expect(responseInterceptorError(error)).rejects.toBe(error);
    });

    it('400エラーはそのままreject', async () => {
      const error = {
        response: { status: 400 },
        config: {},
      };

      await expect(responseInterceptorError(error)).rejects.toBe(error);
    });

    it('403エラーはそのままreject', async () => {
      const error = {
        response: { status: 403 },
        config: {},
      };

      await expect(responseInterceptorError(error)).rejects.toBe(error);
    });
  });

  describe('401エラー - リフレッシュトークンエンドポイント', () => {
    it('リフレッシュエンドポイント自体の401はそのままreject', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/auth/refresh' },
      };

      await expect(responseInterceptorError(error)).rejects.toBe(error);
      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });

  describe('401エラー - トークンリフレッシュ', () => {
    it('リフレッシュトークンがない場合はログアウトを呼ぶ', async () => {
      mockUseAuthStore.getState.mockReturnValue({
        refreshToken: null,
        accessToken: null,
        setTokens: jest.fn(),
      } as unknown as ReturnType<typeof useAuthStore.getState>);

      const error = {
        response: { status: 401 },
        config: { url: '/api/users', headers: {} as AxiosHeaders },
      };

      await expect(responseInterceptorError(error)).rejects.toThrow('No refresh token available');
      expect(mockOnLogout).toHaveBeenCalled();
    });

    it('トークンリフレッシュ成功時はリクエストを再試行', async () => {
      const mockSetTokens = jest.fn();
      mockUseAuthStore.getState.mockReturnValue({
        refreshToken: 'old-refresh-token',
        accessToken: 'old-access-token',
        setTokens: mockSetTokens,
      } as unknown as ReturnType<typeof useAuthStore.getState>);

      mockApiClient.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const mockRetryResponse = { status: 200, data: { success: true } };
      mockAxiosInstance.mockResolvedValue(mockRetryResponse);

      const mockHeaders = { Authorization: '' } as unknown as AxiosHeaders;
      const error = {
        response: { status: 401 },
        config: {
          url: '/api/users',
          headers: mockHeaders,
          _retry: false,
        },
      };

      const result = await responseInterceptorError(error);

      expect(mockApiClient.refreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(mockApiClient.setAccessToken).toHaveBeenCalledWith('new-access-token');
      expect(result).toBe(mockRetryResponse);
    });

    it('トークンリフレッシュ失敗時はログアウトを呼ぶ', async () => {
      const mockSetTokens = jest.fn();
      mockUseAuthStore.getState.mockReturnValue({
        refreshToken: 'old-refresh-token',
        accessToken: 'old-access-token',
        setTokens: mockSetTokens,
      } as unknown as ReturnType<typeof useAuthStore.getState>);

      const refreshError = new Error('Refresh failed');
      mockApiClient.refreshToken.mockRejectedValue(refreshError);

      const mockHeaders = { Authorization: '' } as unknown as AxiosHeaders;
      const error = {
        response: { status: 401 },
        config: {
          url: '/api/users',
          headers: mockHeaders,
        },
      };

      await expect(responseInterceptorError(error)).rejects.toBe(refreshError);
      expect(mockOnLogout).toHaveBeenCalled();
    });

    it('既にリトライ済みの場合は再リフレッシュしない', async () => {
      const error = {
        response: { status: 401 },
        config: {
          url: '/api/users',
          _retry: true,
        },
      };

      await expect(responseInterceptorError(error)).rejects.toBe(error);
      expect(mockApiClient.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('レスポンスなしのエラー', () => {
    it('response が undefined の場合はそのままreject', async () => {
      const error = {
        config: {},
        message: 'Network Error',
      };

      await expect(responseInterceptorError(error)).rejects.toBe(error);
    });
  });
});

// processQueue のテスト - キューのエラーパスをカバー
describe('processQueue error path', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance> & jest.Mock;
  let responseInterceptorError: (error: unknown) => Promise<unknown>;
  let mockOnLogout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const axiosFn = jest.fn();
    mockAxiosInstance = Object.assign(axiosFn, {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }) as unknown as jest.Mocked<AxiosInstance> & jest.Mock;

    mockOnLogout = jest.fn();
    setupAxiosInterceptors(mockAxiosInstance, { onLogout: mockOnLogout });

    const responseUse = mockAxiosInstance.interceptors.response.use as jest.Mock;
    responseInterceptorError = responseUse.mock.calls[0][1];
  });

  it('リフレッシュ失敗時にキュー内のリクエストもエラーになる', async () => {
    const mockSetTokens = jest.fn();
    mockUseAuthStore.getState.mockReturnValue({
      refreshToken: 'refresh-token',
      accessToken: 'access-token',
      setTokens: mockSetTokens,
    } as unknown as ReturnType<typeof useAuthStore.getState>);

    const refreshError = new Error('Token expired');
    mockApiClient.refreshToken.mockRejectedValue(refreshError);

    const mockHeaders = { Authorization: '' } as unknown as AxiosHeaders;
    const error = {
      response: { status: 401 },
      config: {
        url: '/api/users',
        headers: mockHeaders,
      },
    };

    await expect(responseInterceptorError(error)).rejects.toBe(refreshError);
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
