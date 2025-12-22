import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

// コンポーネント
export function AppLogo() {
  return (
    <View className="items-center mb-12">
      <Surface
        elevation={0}
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: colors.brand[600],
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <MaterialCommunityIcons name="microphone" size={40} color={colors.text.inverse} />
      </Surface>
      <Text variant="headlineLarge" className="font-bold text-t-text-primary mb-2">
        VoiceBookLM
      </Text>
      <Text variant="bodyLarge" className="text-t-text-secondary">
        音声からアイデアを記録
      </Text>
    </View>
  );
}
