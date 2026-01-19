import { apiClient } from '@/src/api';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { useProcessingStore } from '@/src/shared/stores/processingStore';
import { useFocusEffect } from '@react-navigation/native';
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

  const processingStatus = useProcessingStore((state) => state.status);

  const fetchMemos = useCallback(async () => {
    try {
      // 初回ロード時のみローディング表示（Stale-While-Revalidate）
      if (memos.length === 0) {
        setIsLoading(true);
      }
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
  }, [memos.length]);

  // 画面フォーカス時に常に再取得
  useFocusEffect(
    useCallback(() => {
      fetchMemos();
    }, [fetchMemos])
  );

  // AI整形完了時に再取得
  useEffect(() => {
    if (processingStatus === 'completed') {
      fetchMemos();
    }
  }, [processingStatus, fetchMemos]);

  return {
    memos,
    isLoading,
    error,
    refresh: fetchMemos,
  };
}
