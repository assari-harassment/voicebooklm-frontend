import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Native 向け SecureStorage 実装
 * expo-secure-store を使用してセキュアにデータを保存
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
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
