import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { Chip } from 'react-native-paper';

// 型定義
interface NoteTagsProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

// コンポーネント
export function NoteTags({ tags, onAddTag, onRemoveTag }: NoteTagsProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  return (
    <View className="mb-4">
      <View className="flex-row flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip
            key={tag}
            onClose={() => onRemoveTag(tag)}
            closeIcon={() => (
              <MaterialCommunityIcons name="close" size={16} color={colors.text.secondary} />
            )}
            style={{
              backgroundColor: colors.bg.tertiary,
              borderWidth: 1,
              borderColor: colors.border.primary,
              // シャドウ（iOS）
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              // シャドウ（Android）
              elevation: 1,
            }}
            textStyle={{ color: colors.text.primary, fontSize: 14 }}
          >
            {tag}
          </Chip>
        ))}
        {isAddingTag ? (
          <View className="mr-2">
            <RNTextInput
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              onBlur={() => {
                if (newTag.trim()) {
                  handleAddTag();
                } else {
                  setIsAddingTag(false);
                }
              }}
              placeholder="タグ名"
              className="px-3 py-2 border border-t-brand-500 rounded-lg bg-t-bg-primary text-sm min-w-[100px]"
              autoFocus
            />
          </View>
        ) : (
          <Chip
            icon={({ size }) => (
              <MaterialCommunityIcons name="plus" size={size} color={colors.text.secondary} />
            )}
            onPress={() => setIsAddingTag(true)}
            style={{
              backgroundColor: colors.bg.primary,
              borderWidth: 1,
              borderColor: colors.border.primary,
              // シャドウ（iOS）
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              // シャドウ（Android）
              elevation: 1,
            }}
            textStyle={{ color: colors.text.secondary, fontSize: 14 }}
          >
            タグを追加
          </Chip>
        )}
      </View>
    </View>
  );
}
