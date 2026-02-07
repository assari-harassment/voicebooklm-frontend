import { colors } from '@/src/shared/constants';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { TextInput } from 'react-native';

interface MarkdownEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface MarkdownEditorRef {
  focus: () => void;
  blur: () => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  ({ value, onChangeText, onBlur, placeholder, autoFocus }, ref) => {
    const inputRef = useRef<TextInput>(null);
    const lineHeight = 24;
    const verticalPadding = 12;
    const lineCount = useMemo(() => value.split('\n').length, [value]);
    const editorHeight = Math.max(1, lineCount) * lineHeight + verticalPadding * 2;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    return (
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        multiline
        autoFocus={autoFocus}
        accessibilityLabel="メモの本文"
        accessibilityHint="メモの内容を入力してください"
        style={{
          fontSize: 16,
          lineHeight,
          color: colors.text.primary,
          height: editorHeight,
          textAlignVertical: 'top',
          padding: verticalPadding,
        }}
      />
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';
