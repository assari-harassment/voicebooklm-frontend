import type { MemoDetailResponse } from '@/src/api/generated/apiSchema';
import { apiClient } from '@/src/api';
import { useCallback, useEffect, useState } from 'react';

interface UseMemoDetailResult {
  memo: MemoDetailResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * メモ詳細を取得するカスタムフック
 */
export function useMemoDetail(memoId: string): UseMemoDetailResult {
  const [memo, setMemo] = useState<MemoDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemo = useCallback(async () => {
    if (!memoId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getMemo(memoId);
      setMemo(data);
    } catch (e) {
      const err = e instanceof Error ? e : new Error('メモの取得に失敗しました');
      setError(err);
      if (__DEV__) {
        console.error('Failed to fetch memo:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [memoId]);

  useEffect(() => {
    fetchMemo();
  }, [fetchMemo]);

  return {
    memo,
    isLoading,
    error,
    refetch: fetchMemo,
  };
}
