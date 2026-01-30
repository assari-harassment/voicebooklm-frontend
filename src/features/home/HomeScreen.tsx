import { ConfirmDialog } from '@/src/shared/components';
import { useDeleteMemoFlow } from '@/src/shared/hooks/useDeleteMemoFlow';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { FolderList } from './folder-list';
import { RecentNotes, useRecentMemos } from './recent-notes';
import { RecordFab } from './record-fab';

export function HomeScreen() {
  const { memos, isLoading, error, refresh } = useRecentMemos();
  const {
    memoToDelete,
    isDeleteDialogVisible,
    handleDeleteRequest,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useDeleteMemoFlow({ onDeleted: refresh });

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
          onDeleteRequest={handleDeleteRequest}
          isLoading={isLoading}
          error={error}
        />

        {/* フォルダ一覧 */}
        <FolderList onMemoClick={handleMemoClick} />
      </ScrollView>

      {/* 録音ボタン (FAB) */}
      <RecordFab onPress={handleStartRecording} />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        visible={isDeleteDialogVisible}
        title="メモを削除"
        message={
          memoToDelete
            ? `「${memoToDelete.title?.trim() || '無題のメモ'}」を本当に削除してもいいですか？`
            : ''
        }
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </View>
  );
}
