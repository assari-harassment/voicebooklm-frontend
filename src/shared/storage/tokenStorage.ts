import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * zustand persist 用の StateStorage インターフェース実装
 * SecureStore を使用してセキュアにデータを永続化する
 *
 * 使用箇所:
 * - authStore の persist middleware で認証トークンを安全に保存
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      // 破損データの場合は null を返す
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};
