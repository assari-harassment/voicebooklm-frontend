import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { MemoCard } from '@/src/shared/components/MemoCard';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface RecentNotesProps {
  memos: MemoListItemResponse[];
  onMemoClick: (memoId: string) => void;
  onDeleteRequest?: (memo: MemoListItemResponse) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function RecentNotes({
  memos,
  onMemoClick,
  onDeleteRequest,
  isLoading,
  error,
}: RecentNotesProps) {
  return (
    <View className="px-4 pt-4 mb-6">
      {/* セクションヘッダー */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 rounded-sm bg-t-brand-500" />
        <Text variant="titleMedium" className="font-bold text-t-text-primary">
          最近のメモ
        </Text>
      </View>

      {/* ローディング状態 */}
      {isLoading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" />
        </View>
      ) : error ? (
        /* エラー状態 */
        <View className="py-8 items-center">
          <Text variant="bodyMedium" className="text-t-danger-500">
            メモの取得に失敗しました
          </Text>
        </View>
      ) : (
        /* メモカード一覧 */
        <View className="gap-2">
          {memos.map((memo) => (
            <MemoCard
              key={memo.memoId}
              memo={memo}
              onPress={onMemoClick}
              onDeleteRequest={onDeleteRequest}
            />
          ))}

          {/* メモがない場合 */}
          {memos.length === 0 && (
            <View className="py-8 items-center">
              <Text variant="bodyMedium" className="text-t-text-tertiary">
                メモがありません
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
