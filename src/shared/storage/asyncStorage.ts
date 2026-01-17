import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * zustand persist 用の StateStorage インターフェース実装
 * AsyncStorage を使用して非機密データを永続化する
 *
 * 使用箇所:
 * - searchHistoryStore の persist middleware で検索履歴を保存
 */
export const asyncStorage: StateStorage = {
  /**
   * ストレージからアイテムを取得する
   * エラー時はnullを返し、アプリの動作を継続させる（データがない場合と同様の扱い）
   */
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      if (__DEV__) {
        console.error('[asyncStorage.getItem] Failed to get item from AsyncStorage:', {
          key: name,
          error,
        });
      }
      return null;
    }
  },

  /**
   * ストレージにアイテムを保存する
   * エラー時は握りつぶす（zustandのpersistがエラーをcatchしないため、スローするとunhandled rejectionになる）
   */
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      if (__DEV__) {
        console.error('[asyncStorage.setItem] Failed to save item to AsyncStorage:', {
          key: name,
          error,
        });
      }
    }
  },

  /**
   * ストレージからアイテムを削除する
   * エラー時は握りつぶす（zustandのpersistがエラーをcatchしないため、スローするとunhandled rejectionになる）
   */
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      if (__DEV__) {
        console.error('[asyncStorage.removeItem] Failed to remove item from AsyncStorage:', {
          key: name,
          error,
        });
      }
    }
  },
};
