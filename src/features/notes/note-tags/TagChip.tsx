import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

interface TagChipProps {
  tag: string;
  isHighlighted?: boolean;
  onRemove: () => void;
}

export function TagChip({ tag, isHighlighted = false, onRemove }: TagChipProps) {
  return (
    <View
      style={[
        styles.container,
        isHighlighted && styles.highlighted,
        { backgroundColor: isHighlighted ? colors.danger[50] : colors.bg.tertiary },
      ]}
    >
      <Text
        variant="bodySmall"
        style={[styles.text, isHighlighted && { color: colors.danger[600] }]}
      >
        {tag}
      </Text>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        accessibilityLabel={`${tag}タグを削除`}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="close"
          size={14}
          color={isHighlighted ? colors.danger[600] : colors.text.secondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  highlighted: {
    borderColor: colors.danger[100],
  },
  text: {
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 16,
  },
});
