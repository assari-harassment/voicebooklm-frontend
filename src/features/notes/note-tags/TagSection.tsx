import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { TagChip } from './TagChip';
import { TagInput } from './TagInput';
import { useTagSection } from './useTagSection';

interface TagSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagSection({ tags, onAddTag, onRemoveTag }: TagSectionProps) {
  const {
    inputValue,
    inputRef,
    highlightedTagIndex,
    handleSubmit,
    handleKeyPress,
    handleChangeText,
    handleRemoveTag,
    handleSectionPress,
  } = useTagSection({ tags, onAddTag, onRemoveTag });

  return (
    <Pressable
      onPress={handleSectionPress}
      style={styles.container}
      accessibilityLabel="タグセクション"
    >
      {/* アイコン */}
      <MaterialCommunityIcons
        name="tag-multiple-outline"
        size={18}
        color={colors.text.tertiary}
        style={styles.icon}
      />

      {/* タグ一覧 + 入力フィールド */}
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <TagChip
            key={tag}
            tag={tag}
            isHighlighted={highlightedTagIndex === index}
            onRemove={() => handleRemoveTag(tag)}
          />
        ))}
        <TagInput
          ref={inputRef}
          value={inputValue}
          onChangeText={handleChangeText}
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
});
