import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useProcessingStore } from '@/src/shared/stores/processingStore';

import { FolderList } from './folder-list';
import { RecentNotes, useRecentMemos } from './recent-notes';
import { RecordFab } from './record-fab';
import { folderStructure, sampleNotes } from './sample-data';

export function HomeScreen() {
  const { memos, isLoading, error } = useRecentMemos();

  // トースト表示中はFABを無効化
  const isToastVisible = useProcessingStore((state) => state.status !== 'idle');

  const handleMemoClick = (memoId: string) => {
    router.push(`/note/${memoId}`);
  };

  const handleFolderClick = (_folderName: string) => {
    // TODO: Navigate to folder view
  };

  const handleStartRecording = () => {
    router.push('/record');
  };

  return (
    <View className="flex-1 bg-t-bg-secondary">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
        {/* 最近のメモ */}
        {isLoading ? (
          <View className="px-4 mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1 h-5 rounded-sm bg-t-brand-500" />
              <Text variant="titleMedium" className="font-bold text-t-text-primary">
                最近のメモ
              </Text>
            </View>
            <View className="py-8 items-center">
              <ActivityIndicator size="small" />
            </View>
          </View>
        ) : error ? (
          <View className="px-4 mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1 h-5 rounded-sm bg-t-brand-500" />
              <Text variant="titleMedium" className="font-bold text-t-text-primary">
                最近のメモ
              </Text>
            </View>
            <View className="py-8 items-center">
              <Text variant="bodyMedium" className="text-t-danger-500">
                メモの取得に失敗しました
              </Text>
            </View>
          </View>
        ) : (
          <RecentNotes memos={memos} onMemoClick={handleMemoClick} />
        )}

        {/* フォルダ一覧 */}
        <FolderList
          folderStructure={folderStructure}
          notes={sampleNotes}
          onFolderClick={handleFolderClick}
        />
      </ScrollView>

      {/* 録音ボタン (FAB) */}
      <RecordFab onPress={handleStartRecording} disabled={isToastVisible} />
    </View>
  );
}
