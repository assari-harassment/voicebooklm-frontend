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
    } catch (error) {
      // エラー発生時は null を返す
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[secureStorage.getItem] Failed to get item from SecureStore:', {
          key: name,
          error,
        });
      }
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      // エラーをログ出力して再スロー（Zustand middlewareにエラーを伝播）
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[secureStorage.setItem] Failed to save item to SecureStore:', {
          key: name,
          error,
        });
      }
      throw error;
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      // エラーをログ出力して再スロー（Zustand middlewareにエラーを伝播）
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[secureStorage.removeItem] Failed to remove item from SecureStore:', {
          key: name,
          error,
        });
      }
      throw error;
    }
  },
};
