import { apiClient } from '@/src/api';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSearchQuery } from './parseSearchQuery';

interface UseSearchMemosResult {
  memos: MemoListItemResponse[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  loadMoreError: Error | null;
  search: (keyword: string) => void;
  loadMore: () => void;
  totalCount: number;
  hasMore: boolean;
}

// キャッシュ用の型定義
interface CacheEntry {
  memos: MemoListItemResponse[];
  total: number;
  hasMore: boolean;
  timestamp: number;
}

// フック外にキャッシュを保持（メモリキャッシュ）
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5分
const PAGE_SIZE = 20;

/**
 * 検索キャッシュをクリアする
 */
export function clearSearchCache(): void {
  searchCache.clear();
}

/**
 * メモを検索するカスタムフック
 * デバウンス処理（300ms）と無限スクロールを含む
 */
export function useSearchMemos(): UseSearchMemosResult {
  const [memos, setMemos] = useState<MemoListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentKeywordRef = useRef<string>('');
  const memosRef = useRef<MemoListItemResponse[]>([]);

  // memosが変更されたらrefも更新
  useEffect(() => {
    memosRef.current = memos;
  }, [memos]);

  const fetchMemos = useCallback(async (keyword: string, isLoadMore: boolean = false) => {
    const trimmedKeyword = keyword.trim();

    // 空のキーワードの場合は結果をクリア
    if (!trimmedKeyword) {
      setMemos([]);
      setTotalCount(0);
      setHasMore(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    const currentOffset = isLoadMore ? memosRef.current.length : 0;

    // 検索クエリをパースしてタグ・キーワード・正規化キーを取得
    const {
      tags,
      keyword: keywordPart,
      normalizedKey: cacheKey,
    } = parseSearchQuery(trimmedKeyword);

    // キャッシュチェック（初回取得時のみ）
    if (!isLoadMore) {
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // キャッシュヒット - API呼び出しをスキップ
        setMemos(cached.memos);
        setTotalCount(cached.total);
        setHasMore(cached.hasMore);
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
        setLoadMoreError(null);
      } else {
        setIsLoading(true);
        setError(null);
      }

      const params: {
        keyword?: string;
        tags?: string[];
        sort: string;
        order: string;
        limit: number;
        offset: number;
      } = {
        sort: 'updated_at',
        order: 'desc',
        limit: PAGE_SIZE,
        offset: currentOffset,
      };

      if (tags.length > 0) {
        params.tags = tags;
      }
      if (keywordPart) {
        params.keyword = keywordPart;
      }

      const response = await apiClient.listMemos(params);

      // キーワードが変更されていたら結果を破棄
      if (currentKeywordRef.current.trim().toLowerCase() !== trimmedKeyword.toLowerCase()) {
        return;
      }

      const newMemos = isLoadMore ? [...memosRef.current, ...response.memos] : response.memos;

      // キャッシュに保存（初回取得時のみ）
      if (!isLoadMore) {
        searchCache.set(cacheKey, {
          memos: newMemos,
          total: response.total,
          hasMore: response.hasMore,
          timestamp: Date.now(),
        });
      }

      setMemos(newMemos);
      setTotalCount(response.total);
      setHasMore(response.hasMore);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('検索に失敗しました');
      // 追加読み込みエラーは既存結果を保持し、loadMoreErrorに設定
      if (isLoadMore) {
        setLoadMoreError(errorObj);
      } else {
        setError(errorObj);
      }
      if (__DEV__) {
        console.error('Failed to search memos:', err);
      }
    } finally {
      // キーワードが変更されていたらローディング状態を更新しない
      if (currentKeywordRef.current.trim().toLowerCase() === trimmedKeyword.toLowerCase()) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    // ローディング中、追加読み込み中、またはこれ以上データがない場合はスキップ
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    const keyword = currentKeywordRef.current;
    if (!keyword.trim()) {
      return;
    }

    fetchMemos(keyword, true);
  }, [isLoading, isLoadingMore, hasMore, fetchMemos]);

  const search = useCallback(
    (keyword: string) => {
      currentKeywordRef.current = keyword;

      // 既存のタイマーをクリア
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // 空のキーワードは即座に処理
      if (!keyword.trim()) {
        setMemos([]);
        setTotalCount(0);
        setHasMore(false);
        setIsLoading(false);
        setIsLoadingMore(false);
        setError(null);
        setLoadMoreError(null);
        return;
      }

      // 新しい検索開始時に前の結果をクリアし、ローディング状態を設定
      setMemos([]);
      setTotalCount(0);
      setHasMore(false);
      setIsLoading(true);
      setError(null);
      setLoadMoreError(null);

      // デバウンス処理
      debounceTimeoutRef.current = setTimeout(() => {
        fetchMemos(keyword, false);
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
    isLoadingMore,
    error,
    loadMoreError,
    search,
    loadMore,
    totalCount,
    hasMore,
  };
}
