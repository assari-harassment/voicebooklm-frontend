import { colors } from '@/src/shared/constants';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface TagInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onKeyPress: (key: string) => void;
  placeholder?: string;
}

export interface TagInputRef {
  focus: () => void;
  blur: () => void;
}

export const TagInput = forwardRef<TagInputRef, TagInputProps>(
  ({ value, onChangeText, onSubmit, onKeyPress, placeholder = 'タグを編集...' }, ref) => {
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
        onSubmitEditing={onSubmit}
        onKeyPress={(e) => onKeyPress(e.nativeEvent.key)}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
        accessibilityLabel="新しいタグを入力"
        accessibilityHint="Enter または カンマで追加、Backspaceで最後のタグを削除"
      />
    );
  }
);

TagInput.displayName = 'TagInput';

const styles = StyleSheet.create({
  input: {
    flex: 1,
    minWidth: 100,
    fontSize: 13,
    color: colors.text.primary,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
});
