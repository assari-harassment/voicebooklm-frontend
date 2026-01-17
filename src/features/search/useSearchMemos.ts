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

// キャッシュ用の型定義
interface CacheEntry {
  memos: MemoListItemResponse[];
  timestamp: number;
}

// フック外にキャッシュを保持（メモリキャッシュ）
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

/**
 * 検索キャッシュをクリアする
 */
export function clearSearchCache(): void {
  searchCache.clear();
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
    const trimmedKeyword = keyword.trim();

    // 空のキーワードの場合は結果をクリア
    if (!trimmedKeyword) {
      setMemos([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    // キャッシュチェック
    const cacheKey = trimmedKeyword.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // キャッシュヒット - API呼び出しをスキップ
      setMemos(cached.memos);
      setTotalCount(cached.memos.length);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.listMemos({
        keyword: trimmedKeyword,
        sort: 'updated_at',
        order: 'desc',
      });

      // キャッシュに保存
      searchCache.set(cacheKey, {
        memos: response.memos,
        timestamp: Date.now(),
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
