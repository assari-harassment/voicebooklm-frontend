import { apiClient } from '@/src/api';
import type { MemoDetailResponse, VoiceMemoCreatedResponse } from '@/src/api/generated/apiSchema';
import { ConfirmDialog } from '@/src/shared/components';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { NoteContent } from './note-content';
import { TagSection } from './note-tags';
import { EditableTitle } from './note-title';
import { useDebouncedSave } from './shared';
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
  const headerHeight = useHeaderHeight();
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

  // ローカルのタイトル・コンテンツ状態（Controlled Component用）
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');

  // メモが取得できたら初期化
  useEffect(() => {
    if (memo) {
      setLocalTags(memo.tags);
      setLocalTitle(memo.title || '');
      setLocalContent(memo.content || '');
    }
  }, [memo]);

  // タイトル保存処理
  const handleSaveTitle = useCallback(
    async (newTitle: string) => {
      if (!memo) return;

      try {
        await apiClient.updateMemo(memo.memoId, { title: newTitle });
      } catch (error) {
        console.error('Failed to save title:', error);
        Alert.alert('エラー', 'タイトルの保存に失敗しました');
      }
    },
    [memo]
  );

  // コンテンツ保存処理
  const handleSaveContent = useCallback(
    async (newContent: string) => {
      if (!memo) return;

      try {
        await apiClient.updateMemo(memo.memoId, { content: newContent });
      } catch (error) {
        console.error('Failed to save content:', error);
        Alert.alert('エラー', 'コンテンツの保存に失敗しました');
      }
    },
    [memo]
  );

  // タイトル用のdebounced save
  const { flush: flushTitle } = useDebouncedSave({
    value: localTitle,
    initialValue: memo?.title || '',
    delay: 1000,
    onSave: handleSaveTitle,
  });

  // コンテンツ用のdebounced save
  const { flush: flushContent } = useDebouncedSave({
    value: localContent,
    initialValue: memo?.content || '',
    delay: 1000,
    onSave: handleSaveContent,
  });

  // 画面を離れる前に未保存の変更をflush
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // 未保存の変更がある場合は、画面遷移を一時停止して保存を完了させる
      e.preventDefault();
      Promise.all([flushTitle(), flushContent()]).then(() => {
        navigation.dispatch(e.data.action);
      });
    });
    return unsubscribe;
  }, [navigation, flushTitle, flushContent]);

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
      Alert.alert('エラー', 'メモの削除に失敗しました。もう一度お試しください。');
      setIsDeleting(false);
    }
  }, [memo]);

  // ヘッダーの設定
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center">
          {/* 削除ボタン */}
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
        </View>
      ),
    });
  }, [navigation, memo, isDeleting]);

  const handleAddTag = async (tag: string) => {
    if (!memo) return;
    const previousTags = localTags;
    const newTags = [...localTags, tag];
    setLocalTags(newTags);

    try {
      await apiClient.updateMemo(memo.memoId, { tags: newTags });
    } catch {
      setLocalTags(previousTags);
      Alert.alert('エラー', 'タグの追加に失敗しました');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!memo) return;
    const previousTags = localTags;
    const newTags = localTags.filter((tag) => tag !== tagToRemove);
    setLocalTags(newTags);

    try {
      await apiClient.updateMemo(memo.memoId, { tags: newTags });
    } catch {
      setLocalTags(previousTags);
      Alert.alert('エラー', 'タグの削除に失敗しました');
    }
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
          paddingTop: headerHeight,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* タイトル（編集可能） */}
        <EditableTitle value={localTitle} onChange={setLocalTitle} onBlur={flushTitle} />

        {/* メタ情報 */}
        <View className="mb-4">
          {/* フォルダ情報 */}
          {memo.folder && (
            <View className="flex-row items-center gap-1 mb-1">
              <MaterialCommunityIcons
                name="folder-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text variant="bodyMedium" className="text-t-text-secondary">
                {memo.folder.path}
              </Text>
            </View>
          )}

          {/* 日時 */}
          <Text variant="bodySmall" className="text-t-text-tertiary">
            {formatDate(memo.updatedAt)}
          </Text>
        </View>

        {/* タグ一覧 */}
        <TagSection tags={localTags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />

        {/* 本文（編集可能） */}
        <NoteContent
          value={localContent}
          onChange={setLocalContent}
          onBlur={flushContent}
          transcription={memo.transcriptionText}
          showTranscription={false}
          editable
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
