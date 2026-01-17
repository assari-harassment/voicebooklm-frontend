import { apiClient } from '@/src/api';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSearchMemosResult {
  memos: MemoListItemResponse[];
  isLoading: boolean;
  error: Error | null;
  search: (keyword: string) => void;
  totalCount: number;
}

/**
 * メモを検索するカスタムフック
 * デバウンス処理（300ms）を含む
 */
export function useSearchMemos(): UseSearchMemosResult {
  const [memos, setMemos] = useState<MemoListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMemos = useCallback(async (keyword: string) => {
    // 空のキーワードの場合は結果をクリア
    if (!keyword.trim()) {
      setMemos([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.listMemos({
        keyword: keyword.trim(),
        sort: 'updated_at',
        order: 'desc',
      });

      setMemos(response.memos);
      setTotalCount(response.memos.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('検索に失敗しました'));
      if (__DEV__) {
        console.error('Failed to search memos:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(
    (keyword: string) => {
      // 既存のタイマーをクリア
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // 空のキーワードは即座に処理
      if (!keyword.trim()) {
        setMemos([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      // ローディング状態を先に設定
      setIsLoading(true);

      // デバウンス処理
      debounceTimeoutRef.current = setTimeout(() => {
        fetchMemos(keyword);
      }, 300);
    },
    [fetchMemos]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    memos,
    isLoading,
    error,
    search,
    totalCount,
  };
}
