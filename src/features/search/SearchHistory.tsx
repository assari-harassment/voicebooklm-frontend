import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { SearchHistoryItem } from './SearchHistoryItem';

interface SearchHistoryProps {
  history: string[];
  onHistoryItemPress: (keyword: string) => void;
}

/**
 * 検索履歴セクション
 * 履歴がない場合は何も表示しない
 */
export function SearchHistory({ history, onHistoryItemPress }: SearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <View className="px-4 pt-4">
      {/* セクションヘッダー */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 rounded-sm bg-t-warning-500" />
        <Text variant="titleMedium" className="font-bold text-t-text-primary">
          検索履歴
        </Text>
      </View>

      {/* 履歴アイテムリスト */}
      <View className="gap-2">
        {history.map((keyword) => (
          <SearchHistoryItem key={keyword} keyword={keyword} onPress={onHistoryItemPress} />
        ))}
      </View>
    </View>
  );
}
