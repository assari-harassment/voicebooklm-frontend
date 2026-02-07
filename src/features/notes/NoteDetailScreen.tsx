import { apiClient } from '@/src/api';
import type { FormatMemoResponse, MemoDetailResponse } from '@/src/api/generated/apiSchema';
import { ConfirmDialog } from '@/src/shared/components';
import { colors } from '@/src/shared/constants';
import { useProcessingStore } from '@/src/shared/stores/processingStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

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
  const { id, memoData, fromProcessing } = useLocalSearchParams<{
    id: string;
    memoData?: string;
    fromProcessing?: string;
  }>();

  // 削除確認ダイアログの状態
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 画面離脱時の保存処理中フラグ
  const [isSavingOnLeave, setIsSavingOnLeave] = useState(false);

  // 録音後の直接遷移時はmemoDataからパース、それ以外はAPIから取得
  const parsedMemoData = useMemo<MemoDetailResponse | null>(() => {
    if (!memoData) return null;

    try {
      const parsed = JSON.parse(memoData) as MemoDetailResponse | FormatMemoResponse;

      if ('processingTimeMillis' in parsed) {
        return {
          memoId: parsed.memoId,
          title: parsed.title,
          content: parsed.content,
          tags: parsed.tags || [],
          // リアルタイム文字起こしではtranscriptionTextは使用しない
          // (showTranscription=falseで表示されないため、undefinedで問題なし)
          transcriptionText: undefined,
          transcriptionStatus: 'COMPLETED',
          formattingStatus: parsed.formattingStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      if ('transcriptionStatus' in parsed) {
        return parsed;
      }
    } catch (e) {
      if (__DEV__) console.error('Failed to parse memoData:', e);
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

  // 文字起こし編集状態
  const [transcriptionText, setTranscriptionText] = useState('');
  const [initialTranscriptionText, setInitialTranscriptionText] = useState('');
  const [isTranscriptionDirty, setIsTranscriptionDirty] = useState(false);
  const [isTranscriptionLoading, setIsTranscriptionLoading] = useState(false);
  const [hasFetchedTranscription, setHasFetchedTranscription] = useState(false);
  const [isDiscardDialogVisible, setIsDiscardDialogVisible] = useState(false);
  const [isTranscriptionOpen, setIsTranscriptionOpen] = useState(false);
  const pendingNavigationActionRef = useRef<any>(null);

  const processingStatus = useProcessingStore((state) => state.status);
  const startResummarize = useProcessingStore((state) => state.startResummarize);

  // メモが取得できたら初期化
  useEffect(() => {
    if (memo) {
      setLocalTags(memo.tags);
      setLocalTitle(memo.title || '');
      setLocalContent(memo.content || '');
      const initialTranscript = memo.transcriptionText || '';
      setTranscriptionText(initialTranscript);
      setInitialTranscriptionText(initialTranscript);
      setIsTranscriptionDirty(false);
      setHasFetchedTranscription(Boolean(memo.transcriptionText));
    }
  }, [memo]);

  const loadTranscription = useCallback(async () => {
    if (!memo || hasFetchedTranscription || isTranscriptionLoading) {
      return;
    }

    setIsTranscriptionLoading(true);
    try {
      const result = await apiClient.getTranscription(memo.memoId);
      setTranscriptionText(result.transcription);
      setInitialTranscriptionText(result.transcription);
      setIsTranscriptionDirty(false);
      setHasFetchedTranscription(true);
    } catch (err) {
      if (__DEV__) console.error('Failed to load transcription:', err);
      Alert.alert('エラー', '文字起こしの取得に失敗しました');
    } finally {
      setIsTranscriptionLoading(false);
    }
  }, [memo, hasFetchedTranscription, isTranscriptionLoading]);

  useEffect(() => {
    if (memo && isTranscriptionOpen) {
      loadTranscription();
    }
  }, [memo, isTranscriptionOpen, loadTranscription]);

  // タイトル保存処理（再試行機能付き）
  const handleSaveTitle = useCallback(
    async (newTitle: string) => {
      if (!memo) return;

      const attemptSave = async (): Promise<void> => {
        try {
          await apiClient.updateMemo(memo.memoId, { title: newTitle });
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to save title:', error);
          }
          return new Promise((resolve) => {
            Alert.alert(
              'タイトルの保存に失敗',
              '変更は保持されていますが、サーバーへの保存に失敗しました。',
              [
                {
                  text: '閉じる',
                  style: 'cancel',
                  onPress: () => resolve(),
                },
                {
                  text: '再試行',
                  onPress: () => {
                    attemptSave().then(resolve);
                  },
                },
              ]
            );
          });
        }
      };

      await attemptSave();
    },
    [memo]
  );

  // コンテンツ保存処理（再試行機能付き）
  const handleSaveContent = useCallback(
    async (newContent: string) => {
      if (!memo) return;

      const attemptSave = async (): Promise<void> => {
        try {
          await apiClient.updateMemo(memo.memoId, { content: newContent });
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to save content:', error);
          }
          return new Promise((resolve) => {
            Alert.alert(
              'コンテンツの保存に失敗',
              '変更は保持されていますが、サーバーへの保存に失敗しました。',
              [
                {
                  text: '閉じる',
                  style: 'cancel',
                  onPress: () => resolve(),
                },
                {
                  text: '再試行',
                  onPress: () => {
                    attemptSave().then(resolve);
                  },
                },
              ]
            );
          });
        }
      };

      await attemptSave();
    },
    [memo]
  );

  // タイトル用のdebounced save
  const { flush: flushTitle, isDirty: isDirtyTitle } = useDebouncedSave({
    value: localTitle,
    initialValue: memo?.title || '',
    delay: 1000,
    onSave: handleSaveTitle,
  });

  // コンテンツ用のdebounced save
  const { flush: flushContent, isDirty: isDirtyContent } = useDebouncedSave({
    value: localContent,
    initialValue: memo?.content || '',
    delay: 1000,
    onSave: handleSaveContent,
  });

  // 画面を離れる前に未保存の変更をflush
  const attemptLeaveWithSave = useCallback(
    (action: any) => {
      setIsSavingOnLeave(true);
      Promise.all([flushTitle(), flushContent()])
        .then(() => {
          setIsSavingOnLeave(false);
          navigation.dispatch(action);
        })
        .catch((error) => {
          if (__DEV__) {
            console.error('Failed to save memo before leaving:', error);
          }
          Alert.alert(
            'エラー',
            'メモの自動保存に失敗しました。保存されていない変更がある可能性があります。',
            [
              {
                text: 'キャンセル',
                style: 'cancel',
                onPress: () => {
                  setIsSavingOnLeave(false);
                },
              },
              {
                text: '破棄して戻る',
                style: 'destructive',
                onPress: () => {
                  setIsSavingOnLeave(false);
                  navigation.dispatch(action);
                },
              },
            ]
          );
        });
    },
    [flushTitle, flushContent, navigation]
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // すでに保存処理中であれば、これ以上ブロックせず遷移を許可する
      if (isSavingOnLeave) {
        return;
      }

      if (isTranscriptionDirty) {
        e.preventDefault();
        pendingNavigationActionRef.current = e.data.action;
        setIsDiscardDialogVisible(true);
        return;
      }

      // 未保存の変更がない場合は、そのまま遷移を許可する
      if (!isDirtyTitle && !isDirtyContent) {
        return;
      }

      // 未保存の変更がある場合は、画面遷移を一時停止して保存を完了させる
      e.preventDefault();
      attemptLeaveWithSave(e.data.action);
    });
    return unsubscribe;
  }, [
    navigation,
    attemptLeaveWithSave,
    isSavingOnLeave,
    isDirtyTitle,
    isDirtyContent,
    isTranscriptionDirty,
  ]);

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
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (fromProcessing === '1') {
              router.replace('/home');
              return;
            }
            if (navigation.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }}
          className="flex-row items-center px-3 py-2"
          accessibilityRole="button"
          accessibilityLabel="戻る"
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.text.primary} />
          <Text variant="bodyMedium" style={{ color: colors.text.primary, marginLeft: 2 }}>
            戻る
          </Text>
        </TouchableOpacity>
      ),
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

  const handleTranscriptionChange = useCallback(
    (value: string) => {
      setTranscriptionText(value);
      setIsTranscriptionDirty(value !== initialTranscriptionText);
    },
    [initialTranscriptionText]
  );

  const handleCloseTranscription = useCallback(() => {
    setTranscriptionText(initialTranscriptionText);
    setIsTranscriptionDirty(false);
    setIsTranscriptionOpen(false);
  }, [initialTranscriptionText]);

  const transcriptionLineHeight = 24;
  const transcriptionPadding = 12;
  const transcriptionLineCount = useMemo(
    () => transcriptionText.split('\n').length,
    [transcriptionText]
  );
  const transcriptionHeight =
    Math.max(1, transcriptionLineCount) * transcriptionLineHeight + transcriptionPadding * 2;

  const handleConfirmResummarize = () => {
    if (!memo) return;
    if (!transcriptionText.trim()) {
      Alert.alert('エラー', '文字起こしが空です');
      return;
    }

    startResummarize(memo.memoId, transcriptionText);
    router.replace('/home');
  };

  const handleDiscardTranscription = () => {
    setIsDiscardDialogVisible(false);
    setTranscriptionText(initialTranscriptionText);
    setIsTranscriptionDirty(false);

    const pendingAction = pendingNavigationActionRef.current;
    pendingNavigationActionRef.current = null;
    if (pendingAction) {
      if (!isDirtyTitle && !isDirtyContent) {
        navigation.dispatch(pendingAction);
      } else {
        attemptLeaveWithSave(pendingAction);
      }
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
        className="flex-1 bg-t-bg-secondary"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: headerHeight + 16,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[1200px] mx-auto">
          <View className="flex flex-col gap-6 md:flex-row md:gap-8 md:items-start">
            <View className="flex-1 md:flex-[6] md:pr-2">
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
                    <Text
                      variant="bodyMedium"
                      className="text-t-text-secondary"
                      style={{ color: colors.text.secondary }}
                    >
                      {memo.folder.path}
                    </Text>
                  </View>
                )}

                {/* 日時 */}
                <Text
                  variant="bodySmall"
                  className="text-t-text-tertiary"
                  style={{ color: colors.text.tertiary }}
                >
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
              {!isTranscriptionOpen && (
                <View className="mt-4">
                  <Button
                    mode="outlined"
                    style={styles.secondaryButton}
                    contentStyle={styles.secondaryButtonContent}
                    labelStyle={styles.secondaryButtonLabel}
                    onPress={() => setIsTranscriptionOpen(true)}
                    textColor={colors.text.primary}
                  >
                    文字起こしを開く
                  </Button>
                </View>
              )}
            </View>

            {isTranscriptionOpen && (
              <View className="flex-1 md:flex-[4] md:pl-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    variant="titleSmall"
                    className="text-t-text-primary"
                    style={{ color: colors.text.primary }}
                  >
                    文字起こし
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseTranscription}
                    className="flex-row items-center px-2 py-1"
                    accessibilityRole="button"
                    accessibilityLabel="文字起こしを閉じる"
                  >
                    <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                      閉じる
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-t-bg-primary border border-t-border-primary rounded-xl p-1">
                  {isTranscriptionLoading ? (
                    <View style={styles.transcriptionLoading}>
                      <ActivityIndicator size="small" color={colors.brand[500]} />
                      <Text
                        variant="bodySmall"
                        className="text-t-text-tertiary"
                        style={{ color: colors.text.tertiary }}
                      >
                        文字起こしを読み込み中...
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      value={transcriptionText}
                      onChangeText={handleTranscriptionChange}
                      multiline
                      placeholder="文字起こしを編集できます"
                      placeholderTextColor={colors.text.tertiary}
                      style={[
                        styles.transcriptionInput,
                        {
                          height: transcriptionHeight,
                          lineHeight: transcriptionLineHeight,
                          padding: transcriptionPadding,
                        },
                      ]}
                      className="text-base leading-6 md:text-[17px] md:leading-[26px]"
                      accessibilityLabel="文字起こしテキスト"
                      accessibilityHint="文字起こし内容を編集します"
                    />
                  )}
                </View>
                <View className="mt-3 md:items-end">
                  <Button
                    mode="contained"
                    style={styles.actionButton}
                    contentStyle={styles.actionButtonContent}
                    labelStyle={styles.actionButtonLabel}
                    onPress={handleConfirmResummarize}
                    disabled={processingStatus === 'processing'}
                    buttonColor={colors.brand[600]}
                    textColor={colors.text.inverse}
                  >
                    AIで再整形
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
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

      <ConfirmDialog
        visible={isDiscardDialogVisible}
        title="変更を破棄しますか？"
        message="編集した文字起こしの変更は失われます。"
        confirmText="破棄する"
        cancelText="キャンセル"
        onConfirm={handleDiscardTranscription}
        onCancel={() => setIsDiscardDialogVisible(false)}
        variant="warning"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  transcriptionInput: {
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  transcriptionLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 10,
  },
  secondaryButton: {
    borderRadius: 10,
    borderColor: colors.border.primary,
    width: '100%',
  },
  secondaryButtonContent: {
    height: 40,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonContent: {
    height: 44,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
