import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

const INDENT_WIDTH = 24;

/**
 * 日付をフォーマットする
 * ISO文字列を "MM/DD" 形式に変換（横幅を抑えるため）
 */
function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

interface FolderMemoItemProps {
  memo: MemoListItemResponse;
  depth: number;
  onPress: () => void;
}

/**
 * フォルダ内のメモ行を表示するコンポーネント
 */
export function FolderMemoItem({ memo, depth, onPress }: FolderMemoItemProps) {
  return (
    <TouchableRipple onPress={onPress} className="py-2 rounded-lg">
      <View className="flex-row items-center gap-2" style={{ marginLeft: depth * INDENT_WIDTH }}>
        <Text variant="bodySmall" className="text-t-text-tertiary" style={{ minWidth: 45 }}>
          {formatShortDate(memo.updatedAt)}
        </Text>
        <Text variant="bodyMedium" className="text-t-text-primary flex-1" numberOfLines={1}>
          {memo.title || '無題のメモ'}
        </Text>
      </View>
    </TouchableRipple>
  );
}
