import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Surface, Text } from 'react-native-paper';

import { MarkdownEditor, type MarkdownEditorRef } from './MarkdownEditor';

// スタイル
const markdownStyles = {
  body: { color: colors.text.primary, fontSize: 16, lineHeight: 24 },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginVertical: 10,
    color: colors.text.primary,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginVertical: 8,
    color: colors.text.primary,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginVertical: 6,
    color: colors.text.primary,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand[500],
    paddingLeft: 10,
    fontStyle: 'italic' as const,
    color: colors.text.secondary,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontFamily: 'System' as const,
  },
  code_block: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontFamily: 'System' as const,
  },
  list_item: { marginVertical: 4 },
  bullet_list: { marginVertical: 8 },
};

// 型定義
interface NoteContentProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => Promise<void> | void;
  transcription?: string;
  showTranscription: boolean;
  editable?: boolean;
}

// コンポーネント
export function NoteContent({
  value,
  onChange,
  onBlur,
  transcription,
  showTranscription,
  editable = false,
}: NoteContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<MarkdownEditorRef>(null);

  const handlePress = useCallback(() => {
    if (editable) {
      setIsEditing(true);
    }
  }, [editable]);

  const handleBlur = useCallback(async () => {
    if (onBlur) {
      await onBlur();
    }
    setIsEditing(false);
  }, [onBlur]);

  // 編集モード
  if (isEditing && editable) {
    return (
      <Surface className="bg-t-bg-primary rounded-xl p-1" elevation={0}>
        {/* 表示モードの鉛筆アイコン行と同じ高さのスペーサー */}
        <View className="flex-row items-center justify-end px-2 pt-1 h-5" />
        <MarkdownEditor
          ref={editorRef}
          value={value}
          onChangeText={onChange}
          onBlur={handleBlur}
          placeholder="メモを入力..."
          autoFocus
        />
      </Surface>
    );
  }

  // 表示モード
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={editable ? 0.7 : 1}
      disabled={!editable}
      accessibilityRole={editable ? 'button' : undefined}
      accessibilityLabel={editable ? 'メモを編集' : undefined}
    >
      <Surface className="bg-t-bg-primary rounded-xl p-1" elevation={0}>
        {/* 編集可能ヒント */}
        {editable && (
          <View className="flex-row items-center justify-end px-2 pt-1">
            <MaterialCommunityIcons
              name="pencil-outline"
              size={14}
              color={colors.text.tertiary}
              style={{ opacity: 0.5 }}
            />
          </View>
        )}

        {showTranscription && transcription ? (
          <Text className="text-t-text-primary text-base leading-6 p-2">{transcription}</Text>
        ) : (
          <Markdown style={markdownStyles}>{value || 'メモをタップして編集...'}</Markdown>
        )}
      </Surface>
    </TouchableOpacity>
  );
}
