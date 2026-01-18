import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => Promise<void>;
}

export function EditableTitle({ value, onChange, onBlur }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handlePress = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(async () => {
    if (onBlur) {
      await onBlur();
    }
    setIsEditing(false);
  }, [onBlur]);

  const displayTitle = value || '無題のメモ';

  if (isEditing) {
    return (
      <View className="flex-row items-center mb-2">
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={handleBlur}
          autoFocus
          maxLength={100}
          placeholder="タイトルを入力"
          placeholderTextColor={colors.text.tertiary}
          style={{
            flex: 1,
            fontSize: 22,
            fontWeight: '600',
            color: colors.text.primary,
            padding: 0,
          }}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center mb-2"
      activeOpacity={0.7}
    >
      <Text
        variant="titleLarge"
        className="font-semibold text-t-text-primary flex-1"
        numberOfLines={2}
      >
        {displayTitle}
      </Text>
      <MaterialCommunityIcons
        name="pencil-outline"
        size={18}
        color={colors.text.tertiary}
        style={{ marginLeft: 8, opacity: 0.6 }}
      />
    </TouchableOpacity>
  );
}
