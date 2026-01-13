import { apiClient } from '@/src/api';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { useCallback, useEffect, useState } from 'react';

interface UseRecentMemosResult {
  memos: MemoListItemResponse[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * 最近のメモを取得するカスタムフック
 * 更新日時の降順で最新3件を取得
 */
export function useRecentMemos(): UseRecentMemosResult {
  const [memos, setMemos] = useState<MemoListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.listMemos({
        sort: 'updated_at',
        order: 'desc',
        limit: 3,
      });

      setMemos(response.memos);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('メモの取得に失敗しました'));
      if (__DEV__) {
        console.error('Failed to fetch recent memos:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  return {
    memos,
    isLoading,
    error,
    refresh: fetchMemos,
  };
}
