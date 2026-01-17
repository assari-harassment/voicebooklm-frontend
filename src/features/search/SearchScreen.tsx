import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { MemoCard } from '@/src/shared/components/MemoCard';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { ActivityIndicator, IconButton, Surface, Text } from 'react-native-paper';
import { PopularTags } from './popular-tags';
import { SearchHistory } from './SearchHistory';
import { useSearchHistory } from './useSearchHistory';
import { useSearchMemos } from './useSearchMemos';

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
  const {
    memos,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    search,
    loadMore,
    totalCount,
    hasMore,
  } = useSearchMemos();
  const { recentHistory, isHydrated, recordSearch } = useSearchHistory();

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    search(text);
  };

  const handleClearSearch = () => {
    setSearchText('');
    search('');
  };

  // Enter押下時に履歴を記録
  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      recordSearch(trimmed);
    }
  };

  // 履歴アイテムクリック時に検索実行
  const handleHistoryItemPress = useCallback(
    (keyword: string) => {
      setSearchText(keyword);
      search(keyword);
      recordSearch(keyword);
    },
    [search, recordSearch]
  );

  // タグクリック時に検索実行
  const handleTagPress = useCallback(
    (tag: string) => {
      const tagKeyword = `#${tag}`;
      setSearchText(tagKeyword);
      search(tagKeyword);
      recordSearch(tagKeyword);
    },
    [search, recordSearch]
  );

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

  // 検索前の状態（検索テキストが空）
  const isInitialState = !isLoading && !error && searchText.trim().length === 0;
  // 検索中の状態（検索テキストがあり、ローディング中またはエラーではない）
  const hasSearchText = searchText.trim().length > 0;
  // 検索履歴を表示するかどうか（hydration完了後のみ履歴を表示）
  const showSearchHistory = isHydrated && isInitialState && recentHistory.length > 0;

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

  // フッターコンポーネント（追加読み込み中のインジケータ / エラー / 終了メッセージ）
  const ListFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" />
        </View>
      );
    }
    if (loadMoreError) {
      return (
        <View className="py-4 items-center">
          <Text variant="bodySmall" className="text-t-danger-500">
            読み込みに失敗しました。もう一度お試しください。
          </Text>
        </View>
      );
    }
    if (!hasMore && memos.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text variant="bodySmall" className="text-t-text-tertiary">
            すべての結果を表示しました
          </Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, loadMoreError, hasMore, memos.length]);

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
              onSubmitEditing={handleSearchSubmit}
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

      {/* 初期状態（検索前）- 人気タグと履歴を表示 */}
      {isInitialState && (
        <>
          {/* 人気タグセクション */}
          <PopularTags onTagPress={handleTagPress} />

          {/* 検索履歴セクション */}
          {showSearchHistory && (
            <SearchHistory history={recentHistory} onHistoryItemPress={handleHistoryItemPress} />
          )}

          {/* 人気タグも履歴もない場合のプレースホルダ */}
          {!showSearchHistory && <InitialSearchState />}
        </>
      )}

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
          onEndReachedThreshold={0.1}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
