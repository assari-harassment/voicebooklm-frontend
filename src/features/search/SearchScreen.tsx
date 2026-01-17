import { MemoCard } from '@/src/shared/components/MemoCard';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { ActivityIndicator, IconButton, Surface, Text } from 'react-native-paper';
import { useSearchMemos } from './useSearchMemos';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';

/**
 * 検索結果がない場合の表示
 */
function EmptySearchResult() {
  return (
    <View className="py-12 items-center">
      <MaterialCommunityIcons name="file-search-outline" size={48} color={colors.text.tertiary} />
      <Text variant="titleMedium" className="text-t-text-secondary mt-4">
        検索結果がありません
      </Text>
      <Text variant="bodyMedium" className="text-t-text-tertiary mt-2 text-center px-8">
        別のキーワードで検索してみてください
      </Text>
    </View>
  );
}

/**
 * 初期状態（検索前）の表示
 */
function InitialSearchState() {
  return (
    <View className="py-8 items-center">
      <Text variant="bodyMedium" className="text-t-text-tertiary">
        キーワードを入力して検索
      </Text>
    </View>
  );
}

/**
 * アイテム間のセパレーター
 */
function ItemSeparator() {
  return <View className="h-2" />;
}

export function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const { memos, isLoading, isLoadingMore, error, search, loadMore, totalCount } = useSearchMemos();

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    search(text);
  };

  const handleClearSearch = () => {
    setSearchText('');
    search('');
  };

  const handleMemoPress = useCallback((memoId: string) => {
    router.push(`/note/${memoId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MemoListItemResponse }) => (
      <MemoCard memo={item} onPress={handleMemoPress} />
    ),
    [handleMemoPress]
  );

  const keyExtractor = useCallback((item: MemoListItemResponse) => item.memoId, []);

  // 検索前の状態
  const isInitialState = !isLoading && !error && searchText.trim().length === 0;
  // 検索中の状態（検索テキストがあり、ローディング中またはエラーではない）
  const hasSearchText = searchText.trim().length > 0;

  // ヘッダーコンポーネント
  const ListHeader = useCallback(() => {
    if (!hasSearchText || isLoading || error) return null;
    return (
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 rounded-sm bg-t-brand-500" />
        <Text variant="titleMedium" className="font-bold text-t-text-primary">
          検索結果 ({totalCount}件)
        </Text>
      </View>
    );
  }, [hasSearchText, isLoading, error, totalCount]);

  // 空状態コンポーネント
  const ListEmpty = useCallback(() => {
    if (isLoading) return null;
    return <EmptySearchResult />;
  }, [isLoading]);

  // フッターコンポーネント（追加読み込み中のインジケータ）
  const ListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isLoadingMore]);

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

      {/* ローディング状態（初回取得時のみ） */}
      {isLoading && memos.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" />
        </View>
      )}

      {/* エラー状態 */}
      {error && !isLoading && (
        <View className="flex-1 justify-center items-center">
          <Text variant="bodyMedium" className="text-t-danger-500">
            検索に失敗しました
          </Text>
        </View>
      )}

      {/* 初期状態（検索前） */}
      {isInitialState && <InitialSearchState />}

      {/* 検索結果 */}
      {!(isLoading && memos.length === 0) && !error && hasSearchText && (
        <FlatList
          data={memos}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
