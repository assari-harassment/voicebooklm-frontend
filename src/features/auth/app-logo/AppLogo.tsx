import { Image, View } from 'react-native';
import { Text } from 'react-native-paper';

// コンポーネント
export function AppLogo() {
  return (
    <View className="items-center mb-12">
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 24 }}
        resizeMode="contain"
      />
      <Text variant="headlineLarge" className="font-bold text-t-text-primary mb-2">
        VoiceBookLM
      </Text>
      <Text variant="bodyLarge" className="text-t-text-secondary">
        音声からアイデアを記録
      </Text>
    </View>
  );
}
