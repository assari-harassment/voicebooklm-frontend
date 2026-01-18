import { apiClient } from '@/src/api/apiClient';
import { useCallback, useEffect, useRef, useState } from 'react';

const CACHE_TTL = 5 * 60 * 1000; // 5分

interface CacheEntry {
  tags: string[];
  timestamp: number;
}

let tagsCache: CacheEntry | null = null;

interface UsePopularTagsResult {
  tags: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 人気タグ上位10件を取得するカスタムフック
 * 5分間のメモリキャッシュを使用
 */
export function usePopularTags(): UsePopularTagsResult {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchTags = useCallback(async (forceRefetch: boolean = false) => {
    // キャッシュチェック
    if (!forceRefetch && tagsCache && Date.now() - tagsCache.timestamp < CACHE_TTL) {
      setTags(tagsCache.tags);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.listTags({
        sort: 'usage_count',
        order: 'desc',
        limit: 10,
      });

      if (!isMountedRef.current) return;

      // キャッシュに保存
      tagsCache = {
        tags: response.tags,
        timestamp: Date.now(),
      };

      setTags(response.tags);
    } catch (err) {
      if (!isMountedRef.current) return;
      const errorObj = err instanceof Error ? err : new Error('タグの取得に失敗しました');
      setError(errorObj);
      if (__DEV__) {
        console.error('Failed to fetch popular tags:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(() => {
    fetchTags(true);
  }, [fetchTags]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchTags();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    error,
    refetch,
  };
}
