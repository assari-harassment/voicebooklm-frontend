import { apiClient } from '@/src/api';
import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface UseDeleteMemoFlowOptions {
  onDeleted: () => Promise<void> | void;
}

export function useDeleteMemoFlow({ onDeleted }: UseDeleteMemoFlowOptions) {
  const [memoToDelete, setMemoToDelete] = useState<MemoListItemResponse | null>(null);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      await onDeleted();
    } catch (err) {
      if (__DEV__) console.error('Failed to delete memo:', err);
      Alert.alert('エラー', 'メモの削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  }, [memoToDelete, isDeleting, onDeleted]);

  return {
    memoToDelete,
    isDeleteDialogVisible,
    isDeleting,
    handleDeleteRequest,
    handleDeleteCancel,
    handleDeleteConfirm,
  };
}
