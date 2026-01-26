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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
        {/* 最近のメモ */}
        <RecentNotes
          memos={memos}
          onMemoClick={handleMemoClick}
          isLoading={isLoading}
          error={error}
        />

        {/* フォルダ一覧 */}
        <FolderList onMemoClick={handleMemoClick} />
      </ScrollView>

      {/* 録音ボタン (FAB) */}
      <RecordFab onPress={handleStartRecording} />
    </View>
  );
}
