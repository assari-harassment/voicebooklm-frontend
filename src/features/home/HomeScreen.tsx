import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { TwoColumnLayout } from '@/src/shared/components';

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
    <TwoColumnLayout>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
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

      {/* 録音ボタン (FAB) */}
      <RecordFab onPress={handleStartRecording} />
    </TwoColumnLayout>
  );
}
