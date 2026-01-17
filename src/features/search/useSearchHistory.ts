import { useSearchHistoryStore } from '@/src/shared/stores/searchHistoryStore';

const DISPLAY_HISTORY_COUNT = 3;

/**
 * 検索履歴を管理するカスタムフック
 */
export function useSearchHistory() {
  // selectorで直接派生状態を計算（依存配列の管理が不要でバグが少ない）
  const recentHistory = useSearchHistoryStore((state) =>
    state.history.slice(0, DISPLAY_HISTORY_COUNT)
  );
  const isHydrated = useSearchHistoryStore((state) => state.isHydrated);
  const addHistory = useSearchHistoryStore((state) => state.addHistory);
  const removeHistory = useSearchHistoryStore((state) => state.removeHistory);
  const clearHistory = useSearchHistoryStore((state) => state.clearHistory);

  // 検索実行時に履歴を記録
  const recordSearch = (keyword: string) => {
    addHistory(keyword);
  };

  return {
    recentHistory,
    isHydrated,
    recordSearch,
    removeHistory,
    clearHistory,
  };
}
