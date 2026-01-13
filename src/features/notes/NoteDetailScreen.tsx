import type { MemoDetailResponse, VoiceMemoCreatedResponse } from '@/src/api/generated/apiSchema';
import { apiClient } from '@/src/api';
import { ConfirmDialog } from '@/src/shared/components';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { NoteContent } from './note-content';
import { NoteTags } from './note-tags';
import { useMemoDetail } from './useMemoDetail';

// ユーティリティ
function formatDate(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}/${day} ${hours}:${minutes}`;
}

// コンポーネント
export function NoteDetailScreen() {
  const navigation = useNavigation();
  const { id, memoData } = useLocalSearchParams<{
    id: string;
    memoData?: string;
  }>();

  // 削除確認ダイアログの状態
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 録音後の直接遷移時はmemoDataからパース、それ以外はAPIから取得
  const parsedMemoData = useMemo<MemoDetailResponse | null>(() => {
    if (memoData) {
      try {
        const parsed: VoiceMemoCreatedResponse = JSON.parse(memoData);
        return {
          memoId: parsed.memoId,
          title: parsed.title,
          content: parsed.content,
          tags: parsed.tags || [],
          transcriptionText: parsed.transcription,
          transcriptionStatus: parsed.transcriptionStatus,
          formattingStatus: parsed.formattingStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (e) {
        if (__DEV__) console.error('Failed to parse memoData:', e);
        return null;
      }
    }
    return null;
  }, [memoData]);

  // APIからメモ詳細を取得（memoDataがない場合のみ）
  const { memo: fetchedMemo, isLoading, error } = useMemoDetail(parsedMemoData ? '' : id || '');

  // 表示するメモデータ
  const memo = parsedMemoData || fetchedMemo;

  // タグの状態（ローカル編集用）
  const [localTags, setLocalTags] = useState<string[]>([]);

  // メモが取得できたらタグを初期化
  useEffect(() => {
    if (memo) {
      setLocalTags(memo.tags);
    }
  }, [memo]);

  // 削除処理
  const handleDelete = useCallback(async () => {
    if (!memo) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteMemo(memo.memoId);
      setIsDeleteDialogVisible(false);
      router.replace('/home');
    } catch (e) {
      if (__DEV__) console.error('Failed to delete memo:', e);
      setIsDeleting(false);
    }
  }, [memo]);

  // ヘッダーの設定
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsDeleteDialogVisible(true)}
          className="flex-row items-center px-3 py-2"
          disabled={!memo || isDeleting}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger[600]} />
          <Text variant="bodyMedium" style={{ color: colors.danger[600], marginLeft: 4 }}>
            削除
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, memo, isDeleting]);

  const handleAddTag = (tag: string) => {
    setLocalTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLocalTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // ローディング状態
  if (isLoading && !parsedMemoData) {
    return (
      <View className="flex-1 bg-t-bg-secondary items-center justify-center">
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text variant="bodyMedium" className="text-t-text-secondary mt-4">
          メモを読み込み中...
        </Text>
      </View>
    );
  }

  // エラー状態
  if (error && !parsedMemoData) {
    return (
      <View className="flex-1 bg-t-bg-secondary items-center justify-center px-4">
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger[500]} />
        <Text variant="bodyMedium" className="text-t-danger-500 mt-4 text-center">
          メモの取得に失敗しました
        </Text>
        <Text variant="bodySmall" className="text-t-text-tertiary mt-2 text-center">
          {error.message}
        </Text>
      </View>
    );
  }

  // メモがない場合
  if (!memo) {
    return (
      <View className="flex-1 bg-t-bg-secondary items-center justify-center">
        <Text variant="bodyMedium" className="text-t-text-tertiary">
          メモが見つかりません
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-t-bg-secondary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        {/* タイトル */}
        <Text variant="titleLarge" className="font-semibold text-t-text-primary mb-2">
          {memo.title || '無題のメモ'}
        </Text>

        {/* メタ情報 */}
        <View className="flex-row items-center gap-3 mb-4">
          {/* 日時 */}
          <View className="flex-row items-center gap-2">
            <View className="w-1 h-1 rounded-full bg-t-text-tertiary" />
            <Text variant="bodySmall" className="text-t-text-secondary">
              {formatDate(memo.updatedAt)}
            </Text>
          </View>

          {/* フォルダ情報（あれば表示） */}
          {/* TODO: MemoDetailResponseにfolder情報がないため、API拡張が必要 */}
        </View>

        {/* タグ一覧 */}
        <NoteTags tags={localTags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />

        {/* 本文 */}
        <NoteContent
          content={memo.content || ''}
          transcription={memo.transcriptionText}
          showTranscription={false}
        />
      </ScrollView>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        visible={isDeleteDialogVisible}
        title="メモを削除"
        message="このメモを削除してもよろしいですか？この操作は取り消せません。"
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogVisible(false)}
        variant="danger"
      />
    </View>
  );
}
