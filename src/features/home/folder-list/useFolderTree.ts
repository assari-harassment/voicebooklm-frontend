import { apiClient } from '@/src/api';
import type { FolderResponse, MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import type { FolderTreeNode, UseFolderTreeResult } from './types';

/**
 * フラットなフォルダ配列をツリー構造に変換
 */
function buildFolderTree(folders: FolderResponse[]): FolderTreeNode[] {
  const folderMap = new Map<string, FolderTreeNode>();

  // 全フォルダをノード化
  for (const folder of folders) {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId ?? null,
      path: folder.path,
      memoCount: folder.memoCount,
      children: [],
      depth: 0,
    });
  }

  // 親子関係を構築
  const rootFolders: FolderTreeNode[] = [];
  for (const node of folderMap.values()) {
    if (node.parentId && folderMap.has(node.parentId)) {
      const parent = folderMap.get(node.parentId)!;
      parent.children.push(node);
    } else {
      rootFolders.push(node);
    }
  }

  // 深さを計算（再帰的に）
  const calculateDepth = (nodes: FolderTreeNode[], depth: number) => {
    for (const node of nodes) {
      node.depth = depth;
      calculateDepth(node.children, depth + 1);
    }
  };
  calculateDepth(rootFolders, 0);

  // 名前順でソート（再帰的に）
  const sortChildren = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    for (const n of nodes) {
      sortChildren(n.children);
    }
  };
  sortChildren(rootFolders);

  return rootFolders;
}

/**
 * フォルダツリーとメモを取得・管理するカスタムフック
 */
export function useFolderTree(): UseFolderTreeResult {
  const [rootFolders, setRootFolders] = useState<FolderTreeNode[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [folderMemos, setFolderMemos] = useState<Record<string, MemoListItemResponse[]>>({});
  const [loadingMemoFolderIds, setLoadingMemoFolderIds] = useState<Set<string>>(new Set());
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);

  // フォルダ一覧を取得
  const fetchFolders = useCallback(async () => {
    try {
      // 初回ロード時のみローディング表示（Stale-While-Revalidate）
      if (!hasLoadedRef.current) {
        setIsLoadingFolders(true);
      }
      setError(null);

      const response = await apiClient.listFolders();
      const tree = buildFolderTree(response.folders);
      setRootFolders(tree);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('フォルダの取得に失敗しました'));
      if (__DEV__) {
        console.error('Failed to fetch folders:', err);
      }
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  // フォルダ内のメモを取得
  const loadMemosForFolder = useCallback(
    async (folderId: string) => {
      // 既に取得済みならスキップ
      if (folderMemos[folderId]) {
        return;
      }

      setLoadingMemoFolderIds((prev) => new Set([...prev, folderId]));

      try {
        const response = await apiClient.listMemos({
          folderId,
          includeDescendants: false,
          sort: 'updated_at',
          order: 'desc',
        });

        setFolderMemos((prev) => ({
          ...prev,
          [folderId]: response.memos,
        }));
      } catch (err) {
        if (__DEV__) {
          console.error(`Failed to fetch memos for folder ${folderId}:`, err);
        }
      } finally {
        setLoadingMemoFolderIds((prev) => {
          const next = new Set(prev);
          next.delete(folderId);
          return next;
        });
      }
    },
    [folderMemos]
  );

  // フォルダの展開/折りたたみをトグル
  const toggleFolder = useCallback(
    (folderId: string) => {
      setExpandedFolderIds((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) {
          next.delete(folderId);
        } else {
          next.add(folderId);
          // 展開時にメモを取得
          loadMemosForFolder(folderId);
        }
        return next;
      });
    },
    [loadMemosForFolder]
  );

  // データ再取得
  const refresh = useCallback(async () => {
    setFolderMemos({});
    setExpandedFolderIds(new Set());
    await fetchFolders();
  }, [fetchFolders]);

  // 画面フォーカス時に常に再取得
  useFocusEffect(
    useCallback(() => {
      fetchFolders();
    }, [fetchFolders])
  );

  return {
    rootFolders,
    expandedFolderIds,
    folderMemos,
    loadingMemoFolderIds,
    isLoadingFolders,
    error,
    toggleFolder,
    refresh,
  };
}
