import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

/**
 * 認証復元中のローディング画面
 * アプリ起動時の認証状態確認中に表示される
 */
export function AuthLoadingScreen() {
  return (
    <View className="flex-1 bg-t-bg-primary justify-center items-center">
      {/* Logo */}
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

      {/* App Name */}
      <Text variant="headlineLarge" className="font-bold text-t-text-primary mb-8">
        VoiceBookLM
      </Text>

      {/* Loading Indicator */}
      <ActivityIndicator size="large" color={colors.brand[600]} />
    </View>
  );
}
