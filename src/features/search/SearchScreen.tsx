import { MemoCard } from '@/src/shared/components/MemoCard';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { ActivityIndicator, IconButton, Surface, Text } from 'react-native-paper';
import { useSearchMemos } from './useSearchMemos';

export function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const { memos, isLoading, error, search, totalCount } = useSearchMemos();

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    search(text);
  };

  const handleClearSearch = () => {
    setSearchText('');
    search('');
  };

  const handleMemoPress = (memoId: string) => {
    router.push(`/note/${memoId}`);
  };

  return (
    <View className="flex-1 bg-t-bg-secondary">
      {/* 検索バー */}
      <View className="px-4 pt-4">
        <Surface elevation={1} style={{ backgroundColor: colors.bg.primary, borderRadius: 16 }}>
          <View className="flex-row items-center h-12 px-4">
            <MaterialCommunityIcons name="magnify" size={20} color={colors.text.secondary} />
            <TextInput
              className="flex-1 ml-3"
              style={{ fontSize: 16, color: colors.text.primary }}
              placeholder="メモを検索..."
              placeholderTextColor={colors.text.tertiary}
              value={searchText}
              onChangeText={handleSearchChange}
              autoFocus
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <IconButton
                icon="close-circle"
                size={20}
                iconColor={colors.text.secondary}
                onPress={handleClearSearch}
                className="m-0"
              />
            )}
          </View>
        </Surface>
      </View>

      {/* 検索結果 */}
      <ScrollView className="flex-1 px-4 pt-4">
        {/* ローディング状態 */}
        {isLoading && (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" />
          </View>
        )}

        {/* エラー状態 */}
        {error && !isLoading && (
          <View className="py-8 items-center">
            <Text variant="bodyMedium" className="text-t-danger-500">
              検索に失敗しました
            </Text>
          </View>
        )}

        {/* 検索結果 */}
        {!isLoading && !error && searchText.trim().length > 0 && (
          <>
            {/* 検索結果ヘッダー */}
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1 h-5 rounded-sm bg-t-brand-500" />
              <Text variant="titleMedium" className="font-bold text-t-text-primary">
                検索結果 ({totalCount}件)
              </Text>
            </View>

            {/* メモカード一覧 */}
            <View className="gap-2 pb-4">
              {memos.map((memo) => (
                <MemoCard key={memo.memoId} memo={memo} onPress={handleMemoPress} />
              ))}

              {/* 結果がない場合 */}
              {memos.length === 0 && (
                <View className="py-8 items-center">
                  <Text variant="bodyMedium" className="text-t-text-tertiary">
                    該当するメモがありません
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* 初期状態（検索前） */}
        {!isLoading && !error && searchText.trim().length === 0 && (
          <View className="py-8 items-center">
            <Text variant="bodyMedium" className="text-t-text-tertiary">
              キーワードを入力して検索
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
