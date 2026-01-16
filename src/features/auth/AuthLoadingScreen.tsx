import { colors } from '@/src/shared/constants';
import { ActivityIndicator, Image, View } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * 認証復元中のローディング画面
 * アプリ起動時の認証状態確認中に表示される
 */
export function AuthLoadingScreen() {
  return (
    <View className="flex-1 bg-t-bg-primary justify-center items-center">
      {/* Logo */}
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 24 }}
        resizeMode="contain"
      />

      {/* App Name */}
      <Text variant="headlineLarge" className="font-bold text-t-text-primary mb-8">
        VoiceBookLM
      </Text>

      {/* Loading Indicator */}
      <ActivityIndicator size="large" color={colors.brand[600]} />
    </View>
  );
}
