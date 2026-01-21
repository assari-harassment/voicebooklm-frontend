import { colors } from '@/src/shared/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';

interface LiveTranscriptProps {
  editableTranscript: string;
  onChangeText: (text: string) => void;
}

export function LiveTranscript({ editableTranscript, onChangeText }: LiveTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ユーザーがスクロール中かどうかを追跡
  const handleScrollBeginDrag = useCallback(() => {
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // ユーザーがスクロールを止めてから2秒後に自動スクロールを再開
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // 新しいテキストが追加されたら自動スクロール（ユーザーがスクロール中でない場合）
  useEffect(() => {
    if (scrollViewRef.current && !isUserScrolling) {
      // 少し遅延させてレイアウト完了後にスクロール
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editableTranscript, isUserScrolling]);

  const hasContent = Boolean(editableTranscript);

  // テキストエリアの最小高さを画面の50%に設定
  const minTextAreaHeight = Math.max(windowHeight * 0.5, 300);

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 px-4 py-3"
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleScrollEndDrag}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {hasContent ? (
        <View style={{ minHeight: minTextAreaHeight }}>
          <TextInput
            value={editableTranscript}
            onChangeText={onChangeText}
            multiline
            placeholder=""
            placeholderTextColor={colors.text.tertiary}
            style={{
              fontSize: 17,
              lineHeight: 30,
              color: colors.text.primary,
              textAlignVertical: 'top',
              padding: 0,
              minHeight: minTextAreaHeight,
            }}
            accessibilityLabel="文字起こしテキスト"
            accessibilityHint="タップして編集できます"
          />
        </View>
      ) : (
        <View
          className="flex-1 justify-center items-center"
          style={{ minHeight: minTextAreaHeight }}
        >
          <Text variant="bodyMedium" className="text-t-text-tertiary text-center">
            {'話し始めると文字起こしが表示されます\nテキストはタップして編集できます'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
