import { parseSearchQuery } from '@/src/features/search/parseSearchQuery';
import { asyncStorage } from '@/src/shared/storage/asyncStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_HISTORY_COUNT = 20;

interface SearchHistoryState {
  // 状態
  history: string[];
  isHydrated: boolean;

  // アクション
  addHistory: (keyword: string) => void;
  removeHistory: (keyword: string) => void;
  clearHistory: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      // 初期状態
      history: [],
      isHydrated: false,

      // 履歴を追加（LRU方式：重複は先頭に移動）
      addHistory: (keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;

        const { history } = get();
        // タグの順序を正規化して重複を判定
        // 例: "#開発 #コード" と "#コード #開発" は同じとみなす
        const { normalizedKey } = parseSearchQuery(trimmed);
        const filtered = history.filter(
          (item) => parseSearchQuery(item).normalizedKey !== normalizedKey
        );
        // 先頭に追加し、最大件数を維持
        const newHistory = [trimmed, ...filtered].slice(0, MAX_HISTORY_COUNT);
        set({ history: newHistory });
      },

      // 履歴を削除
      removeHistory: (keyword: string) => {
        const { history } = get();
        const { normalizedKey } = parseSearchQuery(keyword);
        const filtered = history.filter(
          (item) => parseSearchQuery(item).normalizedKey !== normalizedKey
        );
        set({ history: filtered });
      },

      // 履歴をすべてクリア
      clearHistory: () => {
        set({ history: [] });
      },

      // hydration 完了状態を設定
      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'search-history-storage',
      storage: createJSONStorage(() => asyncStorage),
      // history のみ永続化
      partialize: (state) => ({
        history: state.history,
      }),
      // hydration 完了時のコールバック
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error && __DEV__) {
            console.error('Search history hydration failed:', error);
          }
          useSearchHistoryStore.setState({ isHydrated: true });
        };
      },
    }
  )
);
