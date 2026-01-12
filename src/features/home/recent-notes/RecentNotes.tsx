import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { ActivityIndicator, IconButton, Surface, Text, TouchableRipple } from 'react-native-paper';

/**
 * 日時をフォーマットする
 * ISO文字列を "YYYY-MM/DD HH:mm" 形式に変換
 */
function formatDate(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}/${day} ${hours}:${minutes}`;
}

interface RecentNotesProps {
  memos: MemoListItemResponse[];
  onMemoClick: (memoId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function RecentNotes({ memos, onMemoClick, isLoading, error }: RecentNotesProps) {
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
            <Surface
              key={memo.memoId}
              elevation={1}
              style={{ backgroundColor: colors.bg.primary, borderRadius: 12 }}
            >
              <View className="flex-row items-center">
                <TouchableRipple
                  onPress={() => onMemoClick(memo.memoId)}
                  className="flex-1 p-3 rounded-xl"
                  borderless
                >
                  <View className="gap-1">
                    {/* タイトル */}
                    <Text
                      variant="titleSmall"
                      className="text-t-text-primary font-medium"
                      numberOfLines={1}
                    >
                      {memo.title || '無題のメモ'}
                    </Text>

                    {/* タグ */}
                    {memo.tags.length > 0 && (
                      <View className="flex-row flex-wrap gap-1">
                        {memo.tags.map((tag) => (
                          <View
                            key={`${memo.memoId}-${tag}`}
                            className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-t-bg-tertiary border border-t-border-primary"
                          >
                            <MaterialCommunityIcons
                              name="tag-outline"
                              size={12}
                              color={colors.text.secondary}
                            />
                            <Text variant="labelSmall" className="text-t-text-secondary">
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* 日時 */}
                    <View className="flex-row items-center gap-2">
                      <View className="w-1 h-1 rounded-full bg-t-text-tertiary" />
                      <Text variant="bodySmall" className="text-t-text-secondary">
                        {formatDate(memo.updatedAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableRipple>

                {/* メニューボタン */}
                <IconButton icon="dots-vertical" size={16} className="m-0 mr-1" />
              </View>
            </Surface>
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
