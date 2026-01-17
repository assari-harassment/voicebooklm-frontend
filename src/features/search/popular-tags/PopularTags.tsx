import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { PopularTagChip } from './PopularTagChip';
import { usePopularTags } from './usePopularTags';

interface PopularTagsProps {
  onTagPress: (tag: string) => void;
}

/**
 * 人気タグセクション
 * ローディング中・エラー時・タグがない場合は何も表示しない
 */
export function PopularTags({ onTagPress }: PopularTagsProps) {
  const { tags, isLoading, error } = usePopularTags();

  // ローディング中
  if (isLoading) {
    return (
      <View className="px-4 pt-4">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-1 h-5 rounded-sm bg-t-accent-500" />
          <Text variant="titleMedium" className="font-bold text-t-text-primary">
            よく使うタグ
          </Text>
        </View>
        <View className="py-2 items-center">
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  // エラー時またはタグがない場合は非表示
  if (error || tags.length === 0) {
    return null;
  }

  return (
    <View className="px-4 pt-4">
      {/* セクションヘッダー */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 rounded-sm bg-t-accent-500" />
        <Text variant="titleMedium" className="font-bold text-t-text-primary">
          よく使うタグ
        </Text>
      </View>

      {/* タグチップリスト (FlexWrap) */}
      <View className="flex-row flex-wrap gap-2">
        {tags.map((tag) => (
          <PopularTagChip key={tag} tag={tag} onPress={onTagPress} />
        ))}
      </View>
    </View>
  );
}
