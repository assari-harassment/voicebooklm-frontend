import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { ActivityIndicator, Text, TouchableRipple } from 'react-native-paper';
import { FolderMemoItem } from './FolderMemoItem';
import type { FolderTreeNode } from './types';

const INDENT_WIDTH = 24;
const VERTICAL_LINE_LEFT = 9; // chevronアイコンの中心に合わせる

interface FolderTreeItemProps {
  folder: FolderTreeNode;
  isExpanded: boolean;
  isLoadingMemos: boolean;
  memos: MemoListItemResponse[];
  expandedFolderIds: Set<string>;
  loadingMemoFolderIds: Set<string>;
  folderMemos: Record<string, MemoListItemResponse[]>;
  onToggle: (folderId: string) => void;
  onMemoClick: (memoId: string) => void;
}

/**
 * フォルダ行と子要素（サブフォルダ、メモ）を再帰的に表示するコンポーネント
 */
export function FolderTreeItem({
  folder,
  isExpanded,
  isLoadingMemos,
  memos,
  expandedFolderIds,
  loadingMemoFolderIds,
  folderMemos,
  onToggle,
  onMemoClick,
}: FolderTreeItemProps) {
  const hasChildren = folder.children.length > 0;
  const hasContent = hasChildren || memos.length > 0 || isLoadingMemos;

  return (
    <View>
      {/* フォルダ行 */}
      <TouchableRipple onPress={() => onToggle(folder.id)} className="py-3 rounded-lg">
        <View
          className="flex-row items-center gap-2"
          style={{ marginLeft: folder.depth * INDENT_WIDTH }}
        >
          {/* 展開/折りたたみアイコン */}
          <View className="w-4 items-center">
            {hasChildren || folder.memoCount > 0 ? (
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={18}
                color={colors.text.secondary}
              />
            ) : (
              <MaterialCommunityIcons
                name="folder-outline"
                size={16}
                color={colors.text.tertiary}
              />
            )}
          </View>

          {/* フォルダ名 */}
          <Text variant="bodyMedium" className="text-t-text-primary flex-1" numberOfLines={1}>
            {folder.name}
          </Text>

          {/* メモ数バッジ */}
          {folder.memoCount > 0 && (
            <View className="bg-t-bg-tertiary px-2 py-0.5 rounded">
              <Text variant="labelSmall" className="text-t-text-tertiary">
                {folder.memoCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableRipple>

      {/* 展開時のコンテンツ */}
      {isExpanded && hasContent && (
        <View className="relative">
          {/* 縦線 */}
          <View
            className="absolute bg-t-border-primary w-px"
            style={{
              left: folder.depth * INDENT_WIDTH + VERTICAL_LINE_LEFT,
              top: 0,
              bottom: 0,
            }}
          />

          {/* 子フォルダ */}
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              isExpanded={expandedFolderIds.has(child.id)}
              isLoadingMemos={loadingMemoFolderIds.has(child.id)}
              memos={folderMemos[child.id] || []}
              expandedFolderIds={expandedFolderIds}
              loadingMemoFolderIds={loadingMemoFolderIds}
              folderMemos={folderMemos}
              onToggle={onToggle}
              onMemoClick={onMemoClick}
            />
          ))}

          {/* メモ読み込み中 */}
          {isLoadingMemos && (
            <View
              className="py-2 items-center"
              style={{ marginLeft: (folder.depth + 1) * INDENT_WIDTH }}
            >
              <ActivityIndicator size="small" />
            </View>
          )}

          {/* メモ一覧 */}
          {memos.map((memo) => (
            <FolderMemoItem
              key={memo.memoId}
              memo={memo}
              depth={folder.depth + 1}
              onPress={() => onMemoClick(memo.memoId)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
