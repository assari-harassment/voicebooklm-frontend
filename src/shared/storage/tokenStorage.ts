import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

const STORAGE_KEY = 'auth-tokens';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * SecureStore のラッパー関数
 * トークンの保存・取得・削除を行う
 */
export const tokenStorage = {
  /**
   * 保存されたトークンを取得
   */
  getTokens: async (): Promise<StoredTokens | null> => {
    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as StoredTokens;
  },

  /**
   * トークンを保存
   */
  setTokens: async (tokens: StoredTokens): Promise<void> => {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
  },

  /**
   * トークンを削除
   */
  clearTokens: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  },
};

/**
 * zustand persist 用の StateStorage インターフェース実装
 * SecureStore を使用してセキュアにデータを永続化する
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};
