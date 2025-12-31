import * as SecureStore from 'expo-secure-store';
import { secureStorage } from '../tokenStorage';

// Mock のリセット
const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('SecureStore から値を取得する', async () => {
      mockGetItemAsync.mockResolvedValue('test-value');

      const result = await secureStorage.getItem('test-key');

      expect(result).toBe('test-value');
      expect(mockGetItemAsync).toHaveBeenCalledWith('test-key');
    });

    it('値が存在しない場合は null を返す', async () => {
      mockGetItemAsync.mockResolvedValue(null);

      const result = await secureStorage.getItem('non-existent-key');

      expect(result).toBeNull();
    });

    it('SecureStore がエラーをスローした場合は null を返す', async () => {
      // 破損データやセキュリティエラーのシミュレーション
      mockGetItemAsync.mockRejectedValue(new Error('SecureStore error'));

      const result = await secureStorage.getItem('corrupted-key');

      expect(result).toBeNull();
    });

    it('予期しないエラータイプでも null を返す', async () => {
      mockGetItemAsync.mockRejectedValue('unknown error');

      const result = await secureStorage.getItem('key');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('SecureStore に値を保存する', async () => {
      mockSetItemAsync.mockResolvedValue();

      await secureStorage.setItem('test-key', 'test-value');

      expect(mockSetItemAsync).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('JSON文字列を保存できる', async () => {
      mockSetItemAsync.mockResolvedValue();
      const jsonValue = JSON.stringify({ token: 'abc123' });

      await secureStorage.setItem('auth-storage', jsonValue);

      expect(mockSetItemAsync).toHaveBeenCalledWith('auth-storage', jsonValue);
    });
  });

  describe('removeItem', () => {
    it('SecureStore から値を削除する', async () => {
      mockDeleteItemAsync.mockResolvedValue();

      await secureStorage.removeItem('test-key');

      expect(mockDeleteItemAsync).toHaveBeenCalledWith('test-key');
    });

    it('存在しないキーでもエラーにならない', async () => {
      mockDeleteItemAsync.mockResolvedValue();

      await expect(secureStorage.removeItem('non-existent')).resolves.not.toThrow();
    });
  });
});
