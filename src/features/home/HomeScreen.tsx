import { apiClient } from '@/src/api';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { ConfirmDialog } from '@/src/shared/components';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { FolderList } from './folder-list';
import { RecentNotes, useRecentMemos } from './recent-notes';
import { RecordFab } from './record-fab';

export function HomeScreen() {
  const { memos, isLoading, error, refresh } = useRecentMemos();
  const [memoToDelete, setMemoToDelete] = useState<MemoListItemResponse | null>(null);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMemoClick = (memoId: string) => {
    router.push(`/note/${memoId}`);
  };

  const handleStartRecording = () => {
    router.push('/record');
  };

  const handleDeleteRequest = useCallback((memo: MemoListItemResponse) => {
    setMemoToDelete(memo);
    setIsDeleteDialogVisible(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    if (isDeleting) return;
    setIsDeleteDialogVisible(false);
    setMemoToDelete(null);
  }, [isDeleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!memoToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteMemo(memoToDelete.memoId);
      setIsDeleteDialogVisible(false);
      setMemoToDelete(null);
      await refresh();
    } catch (err) {
      if (__DEV__) console.error('Failed to delete memo:', err);
      Alert.alert('エラー', 'メモの削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  }, [memoToDelete, isDeleting, refresh]);

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
