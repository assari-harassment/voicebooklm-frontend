import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { FolderTreeItem } from './FolderTreeItem';
import { useFolderTree } from './useFolderTree';

interface FolderListProps {
  onMemoClick: (memoId: string) => void;
}

/**
 * フォルダツリーとメモ一覧を表示するコンポーネント
 */
export function FolderList({ onMemoClick }: FolderListProps) {
  const {
    rootFolders,
    expandedFolderIds,
    folderMemos,
    loadingMemoFolderIds,
    isLoadingFolders,
    error,
    toggleFolder,
  } = useFolderTree();

  return (
    <View className="px-4 mb-6">
      {/* セクションヘッダー */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 rounded-sm bg-t-success-500" />
        <Text variant="titleMedium" className="font-bold text-t-text-primary">
          フォルダ
        </Text>
      </View>

      {/* ローディング状態 */}
      {isLoadingFolders ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" />
        </View>
      ) : error ? (
        /* エラー状態 */
        <View className="py-8 items-center">
          <Text variant="bodyMedium" className="text-t-danger-500">
            フォルダの取得に失敗しました
          </Text>
        </View>
      ) : rootFolders.length === 0 ? (
        /* フォルダがない場合 */
        <View className="py-8 items-center">
          <Text variant="bodyMedium" className="text-t-text-tertiary">
            フォルダがありません
          </Text>
        </View>
      ) : (
        /* フォルダツリー */
        <View>
          {rootFolders.map((folder) => (
            <FolderTreeItem
              key={folder.id}
              folder={folder}
              isExpanded={expandedFolderIds.has(folder.id)}
              isLoadingMemos={loadingMemoFolderIds.has(folder.id)}
              memos={folderMemos[folder.id] || []}
              expandedFolderIds={expandedFolderIds}
              loadingMemoFolderIds={loadingMemoFolderIds}
              folderMemos={folderMemos}
              onToggle={toggleFolder}
              onMemoClick={onMemoClick}
            />
          ))}
        </View>
      )}
    </View>
  );
}
