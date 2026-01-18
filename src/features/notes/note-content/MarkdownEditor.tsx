import { colors } from '@/src/shared/constants';
import { forwardRef, useImperativeHandle, useRef } from 'react';
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
          flex: 1,
          fontSize: 16,
          lineHeight: 24,
          color: colors.text.primary,
          minHeight: 200,
          textAlignVertical: 'top',
          padding: 12,
        }}
      />
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';
