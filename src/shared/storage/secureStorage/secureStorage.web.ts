import type { StateStorage } from 'zustand/middleware';

/**
 * ブラウザ環境かどうかを判定
 * SSR時はfalseを返す
 */
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Web 向け SecureStorage 実装
 * localStorage を使用（SecureStore は Web 非対応のため）
 *
 * セキュリティ注意:
 * - localStorage は XSS 攻撃に脆弱
 * - HTTPS 環境での使用を推奨
 * - refreshToken のみ保存し、accessToken はメモリ管理することでリスク軽減
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isBrowser) {
      return null;
    }
    try {
      return localStorage.getItem(name);
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[secureStorage.getItem] Failed to get item from localStorage:', {
          key: name,
          error,
        });
      }
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (!isBrowser) {
      return;
    }
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[secureStorage.setItem] Failed to save item to localStorage:', {
          key: name,
          error,
        });
      }
      throw error;
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (!isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(name);
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[secureStorage.removeItem] Failed to remove item from localStorage:', {
          key: name,
          error,
        });
      }
      throw error;
    }
  },
};
