import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { FolderList } from './folder-list';
import { RecentNotes, useRecentMemos } from './recent-notes';
import { RecordFab } from './record-fab';

export function HomeScreen() {
  const { memos, isLoading, error } = useRecentMemos();

  const handleMemoClick = (memoId: string) => {
    router.push(`/note/${memoId}`);
  };

  const handleStartRecording = () => {
    router.push('/record');
  };

  return (
    <View className="flex-1 bg-t-bg-secondary">
      {/* 2カラムレイアウト: デスクトップではサイドバー + メイン、モバイルではシングルカラム */}
      <View className="flex-1 md:flex-row">
        {/* サイドバー: デスクトップのみ表示 */}
        <View className="hidden md:flex md:w-72 border-r border-t-border-primary bg-t-bg-primary">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          >
            <FolderList onMemoClick={handleMemoClick} isSidebar />
          </ScrollView>
        </View>

        {/* メインコンテンツ */}
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: 96,
              maxWidth: 896,
              alignSelf: 'center',
              width: '100%',
            }}
          >
            {/* 最近のメモ */}
            <RecentNotes
              memos={memos}
              onMemoClick={handleMemoClick}
              isLoading={isLoading}
              error={error}
            />

            {/* フォルダ一覧: モバイルのみ表示 */}
            <View className="md:hidden">
              <FolderList onMemoClick={handleMemoClick} />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* 録音ボタン (FAB) */}
      <RecordFab onPress={handleStartRecording} />
    </View>
  );
}
