import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';

/**
 * ツリー構造のフォルダノード
 */
export interface FolderTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  memoCount: number;
  children: FolderTreeNode[];
  depth: number;
}

/**
 * useFolderTree フックの戻り値
 */
export interface UseFolderTreeResult {
  /** ルートフォルダのリスト（子要素含む） */
  rootFolders: FolderTreeNode[];
  /** 展開中のフォルダID Set */
  expandedFolderIds: Set<string>;
  /** フォルダIDごとのメモ配列 */
  folderMemos: Record<string, MemoListItemResponse[]>;
  /** メモ読み込み中のフォルダID Set */
  loadingMemoFolderIds: Set<string>;
  /** フォルダ一覧の読み込み中フラグ */
  isLoadingFolders: boolean;
  /** エラー */
  error: Error | null;
  /** フォルダ展開/折りたたみトグル */
  toggleFolder: (folderId: string) => void;
  /** データ再取得 */
  refresh: () => Promise<void>;
}
