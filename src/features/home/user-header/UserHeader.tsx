import { colors } from '@/src/shared/constants';
import type { User } from '@/src/shared/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 型定義
interface UserHeaderProps {
  user: User | null;
  onAccountClick: () => void;
  onSearchClick: () => void;
}

// コンポーネント
export function UserHeader({ user, onAccountClick, onSearchClick }: UserHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 bg-t-bg-primary"
      style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
    >
      <TouchableRipple onPress={onAccountClick} className="rounded-lg" borderless>
        <View className="flex-row items-center gap-2 px-3 py-2 bg-t-bg-secondary rounded-lg">
          <MaterialCommunityIcons name="account-circle" size={24} color={colors.text.secondary} />
          <Text variant="titleSmall" className="text-t-text-primary font-medium">
            {user?.name || 'Workspace'}
          </Text>
        </View>
      </TouchableRipple>
      <IconButton
        icon="magnify"
        size={24}
        onPress={onSearchClick}
        className="bg-t-bg-primary border border-t-border-secondary"
        accessibilityLabel="検索"
      />
    </View>
  );
}
