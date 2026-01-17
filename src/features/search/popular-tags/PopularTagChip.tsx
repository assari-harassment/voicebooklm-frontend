import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';

interface PopularTagChipProps {
  tag: string;
  onPress: (tag: string) => void;
}

/**
 * 人気タグの個別チップコンポーネント
 */
export function PopularTagChip({ tag, onPress }: PopularTagChipProps) {
  const handlePress = () => {
    onPress(tag);
  };

  return (
    <Surface
      elevation={1}
      style={{
        backgroundColor: colors.bg.primary,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border.primary,
      }}
    >
      <TouchableRipple
        onPress={handlePress}
        borderless
        style={{ borderRadius: 10 }}
        rippleColor="rgba(0, 0, 0, 0.1)"
        accessibilityRole="button"
        accessibilityLabel={`タグ: ${tag}`}
      >
        <View className="flex-row items-center px-3 py-2 gap-1.5">
          <MaterialCommunityIcons name="tag" size={14} color={colors.accent[500]} />
          <Text variant="bodyMedium" className="text-t-text-primary">
            {tag}
          </Text>
        </View>
      </TouchableRipple>
    </Surface>
  );
}
