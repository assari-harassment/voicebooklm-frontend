import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';

interface SearchHistoryItemProps {
  keyword: string;
  onPress: (keyword: string) => void;
}

/**
 * 検索履歴の個別アイテム
 */
export function SearchHistoryItem({ keyword, onPress }: SearchHistoryItemProps) {
  const handlePress = () => {
    onPress(keyword);
  };

  return (
    <Surface elevation={1} style={{ backgroundColor: colors.bg.primary, borderRadius: 12 }}>
      <TouchableRipple
        onPress={handlePress}
        borderless
        style={{ borderRadius: 12 }}
        rippleColor="rgba(0, 0, 0, 0.1)"
        accessibilityRole="button"
        accessibilityLabel={`検索履歴: ${keyword}`}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text variant="bodyLarge" className="text-t-text-primary flex-1" numberOfLines={1}>
            {keyword}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.tertiary} />
        </View>
      </TouchableRipple>
    </Surface>
  );
}
